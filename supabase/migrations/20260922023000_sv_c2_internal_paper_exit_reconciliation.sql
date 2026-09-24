-- SV-C2: durable, evidence-bound internal-paper exits and reconciliation.
--
-- Source-only and inert after migration. This creates no account, schedule,
-- candle writer, provider request, candidate publication or broker path. The
-- command can only consume an already-persisted validated one-minute candle.

set lock_timeout = '5s';
set statement_timeout = '60s';

-- Production admission is deliberately empty-state only. C.2 changes the
-- shape of C.1 rows and replaces three exact C.1 checks, so an environment
-- with any paper state requires a separately reviewed backfill migration.
do $$
begin
  if exists (select 1 from public.internal_paper_accounts)
    or exists (select 1 from public.internal_paper_entry_intents)
    or exists (select 1 from public.internal_paper_fills)
    or exists (select 1 from public.internal_paper_positions)
    or exists (select 1 from public.internal_paper_ledger_entries)
  then
    raise exception 'sv_c2_requires_empty_c1_state';
  end if;

  if not exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'public.internal_paper_ledger_entries'::regclass
      and conname = 'internal_paper_ledger_entries_account_bucket_check'
      and contype = 'c'
      and convalidated
      and pg_catalog.pg_get_constraintdef(oid, true) =
        'CHECK (account_bucket = ANY (ARRAY[''cash''::text, ''position_cost_basis''::text, ''execution_cost_expense''::text]))'
  ) or not exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'public.internal_paper_ledger_entries'::regclass
      and conname = 'internal_paper_ledger_entries_entry_type_check'
      and contype = 'c'
      and convalidated
      and pg_catalog.pg_get_constraintdef(oid, true) =
        'CHECK (entry_type = ''paper_entry_fill''::text)'
  ) or not exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'public.internal_paper_ledger_entries'::regclass
      and conname = 'internal_paper_ledger_entries_amount_check'
      and contype = 'c'
      and convalidated
      and pg_catalog.pg_get_constraintdef(oid, true) =
        'CHECK (amount <> 0::numeric)'
  ) or not exists (
    select 1 from pg_catalog.pg_attribute
    where attrelid = 'public.internal_paper_ledger_entries'::regclass
      and attname = 'intent_id'
      and atttypid = 'uuid'::regtype
      and attnotnull
      and not attisdropped
  ) or not exists (
    select 1 from pg_catalog.pg_attribute
    where attrelid = 'public.internal_paper_ledger_entries'::regclass
      and attname = 'fill_id'
      and atttypid = 'uuid'::regtype
      and attnotnull
      and not attisdropped
  ) then
    raise exception 'sv_c2_unexpected_c1_ledger_contract';
  end if;
end;
$$;

alter table public.internal_paper_accounts
  add column exit_fill_model_version text not null
    default 'internal_paper_immediate_costed_exit_v1',
  add column target_exit_fraction_bps integer not null default 5000,
  add column realized_gross_pnl numeric(20, 6) not null default 0,
  add column realized_net_pnl numeric(20, 6) not null default 0,
  add column total_commission_paid numeric(20, 6) not null default 0;

alter table public.internal_paper_accounts
  add constraint internal_paper_accounts_exit_fill_model_version_check
    check (exit_fill_model_version = 'internal_paper_immediate_costed_exit_v1'),
  add constraint internal_paper_accounts_target_exit_fraction_bps_check
    check (target_exit_fraction_bps between 1 and 9999),
  add constraint internal_paper_accounts_total_commission_paid_check
    check (total_commission_paid >= 0);

alter table public.internal_paper_positions
  add column remaining_quantity bigint,
  add column remaining_cost_basis numeric(20, 6),
  add column entry_commission numeric(20, 6),
  add column remaining_entry_commission numeric(20, 6),
  add column target_exit_completed boolean not null default false,
  add column realized_gross_pnl numeric(20, 6) not null default 0,
  add column realized_net_pnl numeric(20, 6) not null default 0,
  add column exit_commission_total numeric(20, 6) not null default 0,
  add column last_exit_at timestamptz null;

alter table public.internal_paper_positions
  alter column remaining_quantity set not null,
  alter column remaining_cost_basis set not null,
  alter column entry_commission set not null,
  alter column remaining_entry_commission set not null,
  add constraint internal_paper_positions_remaining_quantity_check
    check (remaining_quantity between 0 and quantity),
  add constraint internal_paper_positions_remaining_cost_basis_check
    check (remaining_cost_basis >= 0 and remaining_cost_basis <= cost_basis),
  add constraint internal_paper_positions_entry_commission_check
    check (entry_commission >= 0),
  add constraint internal_paper_positions_remaining_entry_commission_check
    check (
      remaining_entry_commission >= 0
      and remaining_entry_commission <= entry_commission
    ),
  add constraint internal_paper_positions_exit_commission_total_check
    check (exit_commission_total >= 0),
  add constraint internal_paper_positions_status_quantity_check check (
    (status = 'open' and remaining_quantity > 0 and closed_at is null)
    or (status = 'closed' and remaining_quantity = 0 and closed_at is not null)
  );

create unique index internal_paper_positions_id_account_owner_uidx
  on public.internal_paper_positions (id, account_id, owner_user_id);

create function public.app_initialize_internal_paper_position_v2()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.remaining_quantity is null then
    new.remaining_quantity := new.quantity;
  end if;
  if new.remaining_cost_basis is null then
    new.remaining_cost_basis := new.cost_basis;
  end if;
  if new.entry_commission is null then
    select fill.commission into new.entry_commission
    from public.internal_paper_fills fill
    where fill.id = new.entry_fill_id
      and fill.account_id = new.account_id
      and fill.owner_user_id = new.owner_user_id;
  end if;
  if new.entry_commission is null then
    raise exception 'internal_paper_position_entry_fill_missing';
  end if;
  if new.remaining_entry_commission is null then
    new.remaining_entry_commission := new.entry_commission;
  end if;
  return new;
end;
$$;

create trigger internal_paper_initialize_position_v2
  before insert on public.internal_paper_positions
  for each row execute function public.app_initialize_internal_paper_position_v2();

revoke all on function public.app_initialize_internal_paper_position_v2()
  from public, anon, authenticated;

create function public.app_record_internal_paper_entry_commission_v2()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  update public.internal_paper_accounts account
  set total_commission_paid = account.total_commission_paid + new.commission,
      updated_at = now()
  where account.id = new.account_id and account.owner_user_id = new.owner_user_id;
  return new;
end;
$$;

create trigger internal_paper_record_entry_commission_v2
  after insert on public.internal_paper_fills
  for each row execute function public.app_record_internal_paper_entry_commission_v2();

revoke all on function public.app_record_internal_paper_entry_commission_v2()
  from public, anon, authenticated;

create table public.internal_paper_exit_intents (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  account_id uuid not null,
  position_id uuid not null,
  command_key text not null,
  command_digest text not null check (command_digest ~ '^[0-9a-f]{64}$'),
  command_version text not null
    check (command_version = 'internal_paper_exit_command_v1'),
  evidence_version text not null
    check (evidence_version = 'internal_paper_durable_candle_evidence_v1'),
  candle_id uuid not null references public.historical_candles(id) on delete restrict,
  candle_evidence jsonb not null
    check (jsonb_typeof(candle_evidence) = 'object'),
  candle_evidence_digest text not null
    check (candle_evidence_digest ~ '^[0-9a-f]{64}$'),
  ticker text not null check (ticker ~ '^[A-Z][A-Z0-9.]{0,15}$'),
  exit_reason text not null
    check (exit_reason in ('stop_loss', 'target_partial', 'target_final', 'eod')),
  quantity bigint not null check (quantity > 0),
  reference_price numeric(20, 6) not null check (reference_price > 0),
  fill_model_version text not null
    check (fill_model_version = 'internal_paper_immediate_costed_exit_v1'),
  account_config_version text not null,
  status text not null default 'filled' check (status = 'filled'),
  candle_timestamp timestamptz not null,
  submitted_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (id, account_id, owner_user_id),
  unique (account_id, command_key),
  unique (position_id, candle_id),
  foreign key (account_id, owner_user_id)
    references public.internal_paper_accounts(id, owner_user_id) on delete restrict,
  foreign key (position_id, account_id, owner_user_id)
    references public.internal_paper_positions(id, account_id, owner_user_id)
    on delete restrict
);

create table public.internal_paper_exit_fills (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  account_id uuid not null,
  position_id uuid not null,
  intent_id uuid not null,
  fill_sequence integer not null default 1 check (fill_sequence = 1),
  side text not null default 'SELL' check (side = 'SELL'),
  quantity bigint not null check (quantity > 0),
  reference_price numeric(20, 6) not null check (reference_price > 0),
  fill_price numeric(20, 6) not null check (fill_price > 0),
  spread_cost numeric(20, 6) not null check (spread_cost >= 0),
  slippage_cost numeric(20, 6) not null check (slippage_cost >= 0),
  commission numeric(20, 6) not null check (commission >= 0),
  notional numeric(20, 6) not null check (notional > 0),
  net_cash_proceeds numeric(20, 6) not null check (net_cash_proceeds >= 0),
  allocated_cost_basis numeric(20, 6) not null check (allocated_cost_basis > 0),
  allocated_entry_commission numeric(20, 6) not null
    check (allocated_entry_commission >= 0),
  gross_pnl numeric(20, 6) not null,
  net_pnl numeric(20, 6) not null,
  simulated boolean not null default true check (simulated),
  filled_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (id, account_id, owner_user_id),
  unique (intent_id, fill_sequence),
  foreign key (account_id, owner_user_id)
    references public.internal_paper_accounts(id, owner_user_id) on delete restrict,
  foreign key (position_id, account_id, owner_user_id)
    references public.internal_paper_positions(id, account_id, owner_user_id)
    on delete restrict,
  foreign key (intent_id, account_id, owner_user_id)
    references public.internal_paper_exit_intents(id, account_id, owner_user_id)
    on delete restrict
);

create index internal_paper_exit_intents_account_created_idx
  on public.internal_paper_exit_intents (account_id, created_at desc);
create index internal_paper_exit_intents_position_created_idx
  on public.internal_paper_exit_intents (position_id, created_at desc);
create index internal_paper_exit_intents_candle_id_idx
  on public.internal_paper_exit_intents (candle_id);
create index internal_paper_exit_fills_account_filled_idx
  on public.internal_paper_exit_fills (account_id, filled_at desc);
create index internal_paper_exit_fills_position_filled_idx
  on public.internal_paper_exit_fills (position_id, filled_at desc);

alter table public.internal_paper_exit_intents enable row level security;
alter table public.internal_paper_exit_fills enable row level security;
revoke all privileges on table public.internal_paper_exit_intents
  from public, anon, authenticated;
revoke all privileges on table public.internal_paper_exit_fills
  from public, anon, authenticated;

alter table public.internal_paper_ledger_entries
  alter column intent_id drop not null,
  alter column fill_id drop not null,
  add column exit_intent_id uuid null,
  add column exit_fill_id uuid null;

alter table public.internal_paper_ledger_entries
  drop constraint internal_paper_ledger_entries_account_bucket_check,
  add constraint internal_paper_ledger_entries_account_bucket_check check (
    account_bucket in (
      'cash', 'position_cost_basis', 'execution_cost_expense',
      'realized_pnl_income'
    )
  ),
  drop constraint internal_paper_ledger_entries_entry_type_check,
  add constraint internal_paper_ledger_entries_entry_type_check
    check (entry_type in ('paper_entry_fill', 'paper_exit_fill')),
  drop constraint internal_paper_ledger_entries_amount_check,
  add constraint internal_paper_ledger_entries_effect_identity_check check (
    (
      entry_type = 'paper_entry_fill'
      and intent_id is not null and fill_id is not null
      and exit_intent_id is null and exit_fill_id is null
    ) or (
      entry_type = 'paper_exit_fill'
      and intent_id is null and fill_id is null
      and exit_intent_id is not null and exit_fill_id is not null
    )
  ),
  add constraint internal_paper_ledger_entries_exit_intent_fk
    foreign key (exit_intent_id, account_id, owner_user_id)
    references public.internal_paper_exit_intents(id, account_id, owner_user_id)
    on delete restrict,
  add constraint internal_paper_ledger_entries_exit_fill_fk
    foreign key (exit_fill_id, account_id, owner_user_id)
    references public.internal_paper_exit_fills(id, account_id, owner_user_id)
    on delete restrict;

create unique index internal_paper_ledger_exit_intent_bucket_uidx
  on public.internal_paper_ledger_entries (exit_intent_id, account_bucket)
  where exit_intent_id is not null;
create index internal_paper_ledger_exit_fill_id_idx
  on public.internal_paper_ledger_entries (exit_fill_id)
  where exit_fill_id is not null;

create sequence public.internal_paper_ledger_global_sequence start with 1;

create function public.app_assign_internal_paper_ledger_sequence_v1()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  new.ledger_sequence := nextval('public.internal_paper_ledger_global_sequence');
  return new;
end;
$$;

create trigger internal_paper_assign_ledger_sequence_v1
  before insert on public.internal_paper_ledger_entries
  for each row execute function public.app_assign_internal_paper_ledger_sequence_v1();

revoke all on function public.app_assign_internal_paper_ledger_sequence_v1()
  from public, anon, authenticated;

create function public.app_apply_internal_paper_exit_v1(
  p_owner_user_id uuid,
  p_account_id uuid,
  p_position_id uuid,
  p_candle_id uuid,
  p_fill_model_version text,
  p_evidence_version text,
  p_command_version text
)
returns table (
  intent_id uuid,
  fill_id uuid,
  position_id uuid,
  disposition text,
  exit_reason text,
  quantity bigint,
  remaining_quantity bigint,
  fill_price numeric,
  net_cash_proceeds numeric,
  realized_net_pnl numeric,
  account_state_version bigint,
  cash_balance numeric,
  account_status text,
  ledger_entry_count integer
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_account public.internal_paper_accounts%rowtype;
  v_position public.internal_paper_positions%rowtype;
  v_candle public.historical_candles%rowtype;
  v_fetch_run public.historical_candle_fetch_runs%rowtype;
  v_existing public.internal_paper_exit_intents%rowtype;
  v_command_key text;
  v_command_digest text;
  v_evidence_digest text;
  v_evidence jsonb;
  v_fill_id uuid;
  v_reason text;
  v_quantity bigint;
  v_reference_price numeric(20, 6);
  v_fill_price numeric(20, 6);
  v_spread_cost numeric(20, 6);
  v_slippage_cost numeric(20, 6);
  v_notional numeric(20, 6);
  v_net_cash_proceeds numeric(20, 6);
  v_allocated_cost_basis numeric(20, 6);
  v_allocated_entry_commission numeric(20, 6);
  v_gross_pnl numeric(20, 6);
  v_net_pnl numeric(20, 6);
  v_new_remaining_quantity bigint;
  v_new_remaining_cost_basis numeric(20, 6);
  v_new_remaining_entry_commission numeric(20, 6);
  v_local_candle timestamp;
  v_local_opened timestamp;
  v_daily_realized_net numeric(20, 6);
  v_first_ledger_sequence bigint;
begin
  if p_command_version <> 'internal_paper_exit_command_v1'
    or p_fill_model_version <> 'internal_paper_immediate_costed_exit_v1'
    or p_evidence_version <> 'internal_paper_durable_candle_evidence_v1'
    or p_owner_user_id is null or p_account_id is null
    or p_position_id is null or p_candle_id is null
  then
    raise exception 'invalid_internal_paper_exit_command';
  end if;

  select * into v_account
  from public.internal_paper_accounts
  where id = p_account_id and owner_user_id = p_owner_user_id
  for update;
  if not found then raise exception 'internal_paper_account_not_found'; end if;

  select * into v_position
  from public.internal_paper_positions
  where id = p_position_id
    and account_id = p_account_id
    and owner_user_id = p_owner_user_id
  for update;
  if not found then raise exception 'internal_paper_position_not_found'; end if;

  v_command_key := encode(extensions.digest(convert_to(concat_ws(
    ':', 'internal_paper_exit_v1', p_position_id, p_candle_id
  ), 'UTF8'), 'sha256'), 'hex');
  v_command_digest := encode(extensions.digest(convert_to(jsonb_build_object(
    'account_id', p_account_id,
    'candle_id', p_candle_id,
    'command_version', p_command_version,
    'evidence_version', p_evidence_version,
    'fill_model_version', p_fill_model_version,
    'owner_user_id', p_owner_user_id,
    'position_id', p_position_id
  )::text, 'UTF8'), 'sha256'), 'hex');

  select * into v_existing
  from public.internal_paper_exit_intents
  where account_id = p_account_id and command_key = v_command_key;

  if found then
    if v_existing.command_digest <> v_command_digest then
      raise exception 'internal_paper_exit_command_conflict';
    end if;
    select fill.id, fill.fill_price, fill.net_cash_proceeds, fill.net_pnl
      into v_fill_id, v_fill_price, v_net_cash_proceeds, v_net_pnl
    from public.internal_paper_exit_fills fill
    where fill.intent_id = v_existing.id and fill.fill_sequence = 1;
    if v_fill_id is null then
      raise exception 'internal_paper_exit_replay_state_incomplete';
    end if;
    intent_id := v_existing.id;
    fill_id := v_fill_id;
    position_id := p_position_id;
    disposition := 'reused';
    exit_reason := v_existing.exit_reason;
    quantity := v_existing.quantity;
    remaining_quantity := v_position.remaining_quantity;
    fill_price := v_fill_price;
    net_cash_proceeds := v_net_cash_proceeds;
    realized_net_pnl := v_net_pnl;
    account_state_version := v_account.state_version;
    cash_balance := v_account.cash_balance;
    account_status := v_account.status;
    select count(*)::integer into ledger_entry_count
    from public.internal_paper_ledger_entries ledger
    where ledger.exit_intent_id = v_existing.id;
    return next;
    return;
  end if;

  if v_account.exit_fill_model_version <> p_fill_model_version then
    raise exception 'internal_paper_exit_model_mismatch';
  end if;
  if v_position.status <> 'open' or v_position.remaining_quantity <= 0 then
    raise exception 'internal_paper_position_not_open';
  end if;

  select * into v_candle
  from public.historical_candles
  where id = p_candle_id
  for share;
  if not found then raise exception 'internal_paper_exit_candle_not_found'; end if;

  if v_candle.fetch_run_id is null then
    raise exception 'internal_paper_exit_candle_provenance_incomplete';
  end if;
  select * into v_fetch_run
  from public.historical_candle_fetch_runs
  where id = v_candle.fetch_run_id
  for share;

  if not found
    or v_candle.ticker <> v_position.ticker
    or v_candle.interval <> '1min'
    or v_candle.session <> 'regular'
    or v_candle.timezone <> 'America/New_York'
    or v_candle.validation_status <> 'valid'
    or cardinality(v_candle.quality_flags) <> 0
    or v_candle.duplicate_of_id is not null
    or coalesce(length(v_candle.provider_request_id), 0) = 0
    or v_candle.provider <> v_fetch_run.provider
    or v_candle.source <> v_candle.provider
    or v_fetch_run.request_type <> 'time_series'
    or v_fetch_run.interval <> '1min'
    or v_fetch_run.status <> 'completed'
    or v_fetch_run.error_type is not null
    or v_fetch_run.completed_at is null
    or v_fetch_run.completed_at < v_candle.timestamp
    or v_fetch_run.candle_count <= 0
    or v_fetch_run.trading_day_start is null
    or v_fetch_run.trading_day_end is null
    or v_candle.trading_day not between
      v_fetch_run.trading_day_start and v_fetch_run.trading_day_end
    or v_candle.open <= 0 or v_candle.high <= 0
    or v_candle.low <= 0 or v_candle.close <= 0
  then
    raise exception 'internal_paper_exit_candle_not_eligible';
  end if;

  v_local_candle := v_candle.timestamp at time zone 'America/New_York';
  v_local_opened := v_position.opened_at at time zone 'America/New_York';
  if v_candle.timestamp <= v_position.opened_at
    or v_local_candle::date <> v_local_opened::date
    or v_candle.trading_day <> v_local_candle::date
    or extract(isodow from v_local_candle) > 5
    or v_local_candle::time < time '09:30:00'
    or v_local_candle::time >= time '16:00:00'
  then
    raise exception 'internal_paper_exit_candle_outside_position_session';
  end if;

  if v_candle.low <= v_position.stop_price then
    v_reason := 'stop_loss';
    v_quantity := v_position.remaining_quantity;
    v_reference_price := least(v_position.stop_price, v_candle.open);
  elsif v_local_candle::time >= time '15:59:00' then
    v_reason := 'eod';
    v_quantity := v_position.remaining_quantity;
    v_reference_price := v_candle.close;
  elsif v_candle.high >= v_position.target_price
    and not v_position.target_exit_completed
  then
    v_quantity := least(
      v_position.remaining_quantity,
      greatest(1, floor(
        v_position.quantity * v_account.target_exit_fraction_bps / 10000.0
      )::bigint)
    );
    v_reason := case
      when v_quantity = v_position.remaining_quantity then 'target_final'
      else 'target_partial'
    end;
    v_reference_price := v_position.target_price;
  else
    raise exception 'internal_paper_exit_not_triggered';
  end if;

  v_fill_price := round(v_reference_price * (
    1 - ((v_account.spread_bps / 2) + v_account.slippage_bps) / 10000
  ), 6);
  v_spread_cost := round(
    v_reference_price * v_quantity * (v_account.spread_bps / 2) / 10000, 6
  );
  v_slippage_cost := round(
    v_reference_price * v_quantity * v_account.slippage_bps / 10000, 6
  );
  v_notional := round(v_fill_price * v_quantity, 6);
  v_net_cash_proceeds := v_notional - v_account.commission_per_order;
  if v_fill_price <= 0 or v_net_cash_proceeds < 0 then
    raise exception 'internal_paper_exit_cost_rejected';
  end if;

  if v_quantity = v_position.remaining_quantity then
    v_allocated_cost_basis := v_position.remaining_cost_basis;
    v_allocated_entry_commission := v_position.remaining_entry_commission;
  else
    v_allocated_cost_basis := round(
      v_position.cost_basis * v_quantity / v_position.quantity, 6
    );
    v_allocated_entry_commission := round(
      v_position.entry_commission * v_quantity / v_position.quantity, 6
    );
  end if;
  v_gross_pnl := v_notional - v_allocated_cost_basis;
  v_net_pnl := v_gross_pnl - v_account.commission_per_order
    - v_allocated_entry_commission;
  v_new_remaining_quantity := v_position.remaining_quantity - v_quantity;
  v_new_remaining_cost_basis :=
    v_position.remaining_cost_basis - v_allocated_cost_basis;
  v_new_remaining_entry_commission :=
    v_position.remaining_entry_commission - v_allocated_entry_commission;

  v_evidence := jsonb_build_object(
    'adjusted', v_candle.adjusted,
    'cache_key', v_candle.cache_key,
    'close', v_candle.close,
    'fetch_run_id', v_candle.fetch_run_id,
    'high', v_candle.high,
    'interval', v_candle.interval,
    'low', v_candle.low,
    'open', v_candle.open,
    'provider', v_candle.provider,
    'provider_request_id', v_candle.provider_request_id,
    'session', v_candle.session,
    'ticker', v_candle.ticker,
    'timestamp', v_candle.timestamp,
    'timezone', v_candle.timezone,
    'trading_day', v_candle.trading_day,
    'validation_status', v_candle.validation_status
  );
  v_evidence_digest := encode(extensions.digest(
    convert_to(v_evidence::text, 'UTF8'), 'sha256'
  ), 'hex');

  insert into public.internal_paper_exit_intents (
    owner_user_id, account_id, position_id, command_key, command_digest,
    command_version, evidence_version, candle_id, candle_evidence,
    candle_evidence_digest,
    ticker, exit_reason, quantity, reference_price, fill_model_version,
    account_config_version, candle_timestamp, submitted_at
  ) values (
    p_owner_user_id, p_account_id, p_position_id, v_command_key,
    v_command_digest, p_command_version, p_evidence_version, p_candle_id,
    v_evidence, v_evidence_digest, v_position.ticker, v_reason, v_quantity,
    v_reference_price, p_fill_model_version, v_account.config_version,
    v_candle.timestamp, v_fetch_run.completed_at
  ) returning id into intent_id;

  insert into public.internal_paper_exit_fills (
    owner_user_id, account_id, position_id, intent_id, quantity,
    reference_price, fill_price, spread_cost, slippage_cost, commission,
    notional, net_cash_proceeds, allocated_cost_basis,
    allocated_entry_commission, gross_pnl, net_pnl, filled_at
  ) values (
    p_owner_user_id, p_account_id, p_position_id, intent_id, v_quantity,
    v_reference_price, v_fill_price, v_spread_cost, v_slippage_cost,
    v_account.commission_per_order, v_notional, v_net_cash_proceeds,
    v_allocated_cost_basis, v_allocated_entry_commission, v_gross_pnl,
    v_net_pnl, v_candle.timestamp
  ) returning id into v_fill_id;

  update public.internal_paper_positions position
  set remaining_quantity = v_new_remaining_quantity,
      remaining_cost_basis = v_new_remaining_cost_basis,
      remaining_entry_commission = v_new_remaining_entry_commission,
      target_exit_completed = position.target_exit_completed
        or v_reason in ('target_partial', 'target_final'),
      realized_gross_pnl = position.realized_gross_pnl + v_gross_pnl,
      realized_net_pnl = position.realized_net_pnl + v_net_pnl,
      exit_commission_total = position.exit_commission_total
        + v_account.commission_per_order,
      last_exit_at = v_candle.timestamp,
      status = case when v_new_remaining_quantity = 0 then 'closed' else 'open' end,
      closed_at = case
        when v_new_remaining_quantity = 0 then v_candle.timestamp else null
      end,
      updated_at = now()
  where position.id = p_position_id;

  v_first_ledger_sequence := v_account.state_version * 4 + 1;
  insert into public.internal_paper_ledger_entries (
    owner_user_id, account_id, ledger_sequence, exit_intent_id, exit_fill_id,
    account_bucket, amount, entry_type, occurred_at
  ) values
    (p_owner_user_id, p_account_id, v_first_ledger_sequence, intent_id, v_fill_id,
     'cash', v_net_cash_proceeds, 'paper_exit_fill', v_candle.timestamp),
    (p_owner_user_id, p_account_id, v_first_ledger_sequence + 1, intent_id, v_fill_id,
     'position_cost_basis', -v_allocated_cost_basis, 'paper_exit_fill', v_candle.timestamp),
    (p_owner_user_id, p_account_id, v_first_ledger_sequence + 2, intent_id, v_fill_id,
     'realized_pnl_income', -v_gross_pnl, 'paper_exit_fill', v_candle.timestamp),
    (p_owner_user_id, p_account_id, v_first_ledger_sequence + 3, intent_id, v_fill_id,
     'execution_cost_expense', v_account.commission_per_order,
     'paper_exit_fill', v_candle.timestamp);

  select coalesce(sum(exit_fill.net_pnl), 0) into v_daily_realized_net
  from public.internal_paper_exit_fills exit_fill
  where exit_fill.account_id = p_account_id
    and exit_fill.owner_user_id = p_owner_user_id
    and (exit_fill.filled_at at time zone 'America/New_York')::date
      = v_local_candle::date;

  update public.internal_paper_accounts account
  set cash_balance = account.cash_balance + v_net_cash_proceeds,
      realized_gross_pnl = account.realized_gross_pnl + v_gross_pnl,
      realized_net_pnl = account.realized_net_pnl + v_net_pnl,
      total_commission_paid = account.total_commission_paid
        + account.commission_per_order,
      status = case
        when account.status = 'ready'
          and v_daily_realized_net <= -account.daily_loss_cap
        then 'paused'
        else account.status
      end,
      state_version = account.state_version + 1,
      updated_at = now()
  where account.id = p_account_id and account.owner_user_id = p_owner_user_id
  returning account.state_version, account.cash_balance, account.status
    into account_state_version, cash_balance, account_status;

  fill_id := v_fill_id;
  position_id := p_position_id;
  disposition := 'created';
  exit_reason := v_reason;
  quantity := v_quantity;
  remaining_quantity := v_new_remaining_quantity;
  fill_price := v_fill_price;
  net_cash_proceeds := v_net_cash_proceeds;
  realized_net_pnl := v_net_pnl;
  ledger_entry_count := 4;
  return next;
end;
$$;

revoke all on function public.app_apply_internal_paper_exit_v1(
  uuid, uuid, uuid, uuid, text, text, text
) from public, anon, authenticated;
grant execute on function public.app_apply_internal_paper_exit_v1(
  uuid, uuid, uuid, uuid, text, text, text
) to service_role;

create function public.app_read_internal_paper_account_v2(
  p_owner_user_id uuid,
  p_account_id uuid,
  p_read_version text
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
  if p_read_version <> 'internal_paper_readback_v2'
    or p_owner_user_id is null or p_account_id is null
  then
    raise exception 'invalid_internal_paper_readback_command';
  end if;

  select jsonb_build_object(
    'readback_version', 'internal_paper_readback_v2',
    'account_id', account.id,
    'owner_user_id', account.owner_user_id,
    'status', account.status,
    'config_version', account.config_version,
    'state_version', account.state_version,
    'starting_cash', account.starting_cash,
    'cash_balance', account.cash_balance,
    'realized_gross_pnl', account.realized_gross_pnl,
    'realized_net_pnl', account.realized_net_pnl,
    'total_commission_paid', account.total_commission_paid,
    'positions', coalesce((
      select jsonb_agg(to_jsonb(position) order by position.opened_at, position.id)
      from public.internal_paper_positions position
      where position.account_id = account.id
        and position.owner_user_id = account.owner_user_id
    ), '[]'::jsonb),
    'latest_entry_intent', (
      select to_jsonb(entry_intent)
      from public.internal_paper_entry_intents entry_intent
      where entry_intent.account_id = account.id
        and entry_intent.owner_user_id = account.owner_user_id
      order by entry_intent.created_at desc, entry_intent.id desc limit 1
    ),
    'latest_exit_intent', (
      select to_jsonb(exit_intent)
      from public.internal_paper_exit_intents exit_intent
      where exit_intent.account_id = account.id
        and exit_intent.owner_user_id = account.owner_user_id
      order by exit_intent.created_at desc, exit_intent.id desc limit 1
    ),
    'latest_exit_fill', (
      select to_jsonb(exit_fill)
      from public.internal_paper_exit_fills exit_fill
      where exit_fill.account_id = account.id
        and exit_fill.owner_user_id = account.owner_user_id
      order by exit_fill.filled_at desc, exit_fill.id desc limit 1
    ),
    'ledger_entry_count', (
      select count(*) from public.internal_paper_ledger_entries ledger
      where ledger.account_id = account.id
        and ledger.owner_user_id = account.owner_user_id
    ),
    'ledger_balance', coalesce((
      select sum(ledger.amount) from public.internal_paper_ledger_entries ledger
      where ledger.account_id = account.id
        and ledger.owner_user_id = account.owner_user_id
    ), 0)
  ) into v_result
  from public.internal_paper_accounts account
  where account.id = p_account_id and account.owner_user_id = p_owner_user_id;

  if v_result is null then raise exception 'internal_paper_account_not_found'; end if;
  return v_result;
end;
$$;

revoke all on function public.app_read_internal_paper_account_v2(
  uuid, uuid, text
) from public, anon, authenticated;
grant execute on function public.app_read_internal_paper_account_v2(
  uuid, uuid, text
) to service_role;

comment on table public.internal_paper_exit_intents is
  'SV-C2 brokerless exit intents derived only from durable validated candle evidence.';
comment on function public.app_apply_internal_paper_exit_v1(
  uuid, uuid, uuid, uuid, text, text, text
) is
  'SV-C2 atomic conservative stop/target/EOD paper exit with cost, PnL, ledger and exact retry reconciliation.';
