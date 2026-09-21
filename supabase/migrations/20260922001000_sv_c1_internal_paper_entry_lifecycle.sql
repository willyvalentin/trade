-- SV-C1: isolated internal-paper entry lifecycle.
--
-- This schema is deliberately brokerless and inert after migration: it creates
-- no account rows, schedule, route, provider access or live submission path.
-- A separately reviewed activation must provision a frozen experimental
-- account before the command can produce an economic paper effect.

create unique index if not exists recommendation_scan_runs_id_owner_user_id_uidx
  on public.recommendation_scan_runs (id, owner_user_id);
create unique index if not exists recommendation_snapshots_id_owner_user_id_uidx
  on public.recommendation_snapshots (id, owner_user_id);

create table if not exists public.internal_paper_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  account_key text not null,
  status text not null default 'paused'
    check (status in ('ready', 'paused', 'killed')),
  base_currency text not null default 'USD'
    check (base_currency = 'USD'),
  strategy_id text not null,
  strategy_version text not null,
  strategy_rollback_identity text not null,
  symbol_selection_policy_id text not null,
  symbol_selection_policy_version text not null,
  observed_universe_version text not null,
  eligible_symbols text[] not null,
  config_version text not null,
  fill_model_version text not null
    check (fill_model_version = 'internal_paper_immediate_costed_fill_v1'),
  starting_cash numeric(20, 6) not null check (starting_cash > 0),
  cash_balance numeric(20, 6) not null check (cash_balance >= 0),
  per_trade_risk_cap numeric(20, 6) not null check (per_trade_risk_cap > 0),
  daily_loss_cap numeric(20, 6) not null check (daily_loss_cap > 0),
  spread_bps numeric(12, 6) not null check (spread_bps >= 0),
  slippage_bps numeric(12, 6) not null check (slippage_bps >= 0),
  commission_per_order numeric(20, 6) not null check (commission_per_order >= 0),
  max_open_positions integer not null default 1 check (max_open_positions = 1),
  state_version bigint not null default 0 check (state_version >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, owner_user_id),
  unique (owner_user_id, account_key),
  check (cardinality(eligible_symbols) between 1 and 10)
);

create table if not exists public.internal_paper_entry_intents (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  account_id uuid not null,
  command_key text not null,
  command_digest text not null check (command_digest ~ '^[0-9a-f]{64}$'),
  command_version text not null
    check (command_version = 'internal_paper_entry_command_v1'),
  decision_scan_run_id text not null,
  decision_scan_run_fingerprint text not null,
  decision_evidence_digest text not null
    check (decision_evidence_digest ~ '^[0-9a-f]{64}$'),
  candidate_identity text not null,
  snapshot_id text not null,
  snapshot_fingerprint text not null,
  strategy_id text not null,
  strategy_version text not null,
  strategy_rollback_identity text not null,
  symbol_selection_policy_id text not null,
  symbol_selection_policy_version text not null,
  observed_universe_version text not null,
  ticker text not null check (ticker ~ '^[A-Z][A-Z0-9.]{0,15}$'),
  side text not null default 'BUY' check (side = 'BUY'),
  quantity bigint not null check (quantity > 0),
  arrival_price numeric(20, 6) not null check (arrival_price > 0),
  stop_price numeric(20, 6) not null check (stop_price > 0),
  target_price numeric(20, 6) not null check (target_price > 0),
  fill_model_version text not null
    check (fill_model_version = 'internal_paper_immediate_costed_fill_v1'),
  account_config_version text not null,
  status text not null default 'filled' check (status = 'filled'),
  submitted_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (id, account_id, owner_user_id),
  unique (account_id, command_key),
  unique (account_id, decision_evidence_digest, snapshot_fingerprint),
  foreign key (account_id, owner_user_id)
    references public.internal_paper_accounts(id, owner_user_id) on delete restrict,
  foreign key (decision_scan_run_id, owner_user_id)
    references public.recommendation_scan_runs(id, owner_user_id) on delete restrict,
  foreign key (snapshot_id, owner_user_id)
    references public.recommendation_snapshots(id, owner_user_id) on delete restrict
);

create table if not exists public.internal_paper_fills (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  account_id uuid not null,
  intent_id uuid not null,
  fill_sequence integer not null default 1 check (fill_sequence = 1),
  side text not null default 'BUY' check (side = 'BUY'),
  quantity bigint not null check (quantity > 0),
  arrival_price numeric(20, 6) not null check (arrival_price > 0),
  fill_price numeric(20, 6) not null check (fill_price > 0),
  spread_cost numeric(20, 6) not null check (spread_cost >= 0),
  slippage_cost numeric(20, 6) not null check (slippage_cost >= 0),
  commission numeric(20, 6) not null check (commission >= 0),
  notional numeric(20, 6) not null check (notional > 0),
  total_cash_cost numeric(20, 6) not null check (total_cash_cost > 0),
  simulated boolean not null default true check (simulated),
  filled_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (id, account_id, owner_user_id),
  unique (intent_id, fill_sequence),
  foreign key (account_id, owner_user_id)
    references public.internal_paper_accounts(id, owner_user_id) on delete restrict,
  foreign key (intent_id, account_id, owner_user_id)
    references public.internal_paper_entry_intents(id, account_id, owner_user_id)
    on delete restrict
);

create table if not exists public.internal_paper_positions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  account_id uuid not null,
  intent_id uuid not null unique,
  entry_fill_id uuid not null unique,
  ticker text not null check (ticker ~ '^[A-Z][A-Z0-9.]{0,15}$'),
  side text not null default 'LONG' check (side = 'LONG'),
  status text not null default 'open' check (status in ('open', 'closed')),
  quantity bigint not null check (quantity > 0),
  average_entry_price numeric(20, 6) not null check (average_entry_price > 0),
  cost_basis numeric(20, 6) not null check (cost_basis > 0),
  stop_price numeric(20, 6) not null check (stop_price > 0),
  target_price numeric(20, 6) not null check (target_price > 0),
  opened_at timestamptz not null,
  closed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (account_id, owner_user_id)
    references public.internal_paper_accounts(id, owner_user_id) on delete restrict,
  foreign key (intent_id, account_id, owner_user_id)
    references public.internal_paper_entry_intents(id, account_id, owner_user_id)
    on delete restrict,
  foreign key (entry_fill_id, account_id, owner_user_id)
    references public.internal_paper_fills(id, account_id, owner_user_id)
    on delete restrict
);

create table if not exists public.internal_paper_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  account_id uuid not null,
  ledger_sequence bigint not null check (ledger_sequence > 0),
  intent_id uuid not null,
  fill_id uuid not null,
  account_bucket text not null
    check (account_bucket in ('cash', 'position_cost_basis', 'execution_cost_expense')),
  amount numeric(20, 6) not null check (amount <> 0),
  currency text not null default 'USD' check (currency = 'USD'),
  entry_type text not null default 'paper_entry_fill'
    check (entry_type = 'paper_entry_fill'),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (account_id, ledger_sequence),
  unique (intent_id, account_bucket),
  foreign key (account_id, owner_user_id)
    references public.internal_paper_accounts(id, owner_user_id) on delete restrict,
  foreign key (intent_id, account_id, owner_user_id)
    references public.internal_paper_entry_intents(id, account_id, owner_user_id)
    on delete restrict,
  foreign key (fill_id, account_id, owner_user_id)
    references public.internal_paper_fills(id, account_id, owner_user_id)
    on delete restrict
);

create index if not exists internal_paper_accounts_owner_status_idx
  on public.internal_paper_accounts (owner_user_id, status);
create index if not exists internal_paper_entry_intents_owner_created_idx
  on public.internal_paper_entry_intents (owner_user_id, created_at desc);
create index if not exists internal_paper_entry_intents_scan_run_idx
  on public.internal_paper_entry_intents (decision_scan_run_id);
create index if not exists internal_paper_entry_intents_snapshot_idx
  on public.internal_paper_entry_intents (snapshot_id);
create index if not exists internal_paper_fills_account_filled_idx
  on public.internal_paper_fills (account_id, filled_at desc);
create index if not exists internal_paper_positions_owner_status_idx
  on public.internal_paper_positions (owner_user_id, status, opened_at desc);
create unique index if not exists internal_paper_positions_one_open_per_account_uidx
  on public.internal_paper_positions (account_id)
  where status = 'open';
create index if not exists internal_paper_ledger_account_sequence_idx
  on public.internal_paper_ledger_entries (account_id, ledger_sequence);

alter table public.internal_paper_accounts enable row level security;
alter table public.internal_paper_entry_intents enable row level security;
alter table public.internal_paper_fills enable row level security;
alter table public.internal_paper_positions enable row level security;
alter table public.internal_paper_ledger_entries enable row level security;

revoke all privileges on table public.internal_paper_accounts from public, anon, authenticated;
revoke all privileges on table public.internal_paper_entry_intents from public, anon, authenticated;
revoke all privileges on table public.internal_paper_fills from public, anon, authenticated;
revoke all privileges on table public.internal_paper_positions from public, anon, authenticated;
revoke all privileges on table public.internal_paper_ledger_entries from public, anon, authenticated;

create or replace function public.app_apply_internal_paper_entry_v1(
  p_owner_user_id uuid,
  p_account_id uuid,
  p_scan_run_id text,
  p_scan_run_fingerprint text,
  p_snapshot_id text,
  p_snapshot_fingerprint text,
  p_candidate_identity text,
  p_strategy_id text,
  p_strategy_version text,
  p_strategy_rollback_identity text,
  p_symbol_selection_policy_id text,
  p_symbol_selection_policy_version text,
  p_observed_universe_version text,
  p_ticker text,
  p_quantity bigint,
  p_arrival_price numeric,
  p_stop_price numeric,
  p_target_price numeric,
  p_submitted_at timestamptz,
  p_fill_model_version text,
  p_command_version text
)
returns table (
  intent_id uuid,
  fill_id uuid,
  position_id uuid,
  disposition text,
  account_state_version bigint,
  cash_balance numeric,
  fill_price numeric,
  total_cash_cost numeric,
  ledger_entry_count integer
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_account public.internal_paper_accounts%rowtype;
  v_scan_run public.recommendation_scan_runs%rowtype;
  v_snapshot public.recommendation_snapshots%rowtype;
  v_existing public.internal_paper_entry_intents%rowtype;
  v_command_key text;
  v_command_digest text;
  v_decision_evidence_digest text;
  v_fill_id uuid;
  v_position_id uuid;
  v_fill_price numeric(20, 6);
  v_spread_cost numeric(20, 6);
  v_slippage_cost numeric(20, 6);
  v_notional numeric(20, 6);
  v_total_cash_cost numeric(20, 6);
  v_risk_at_stop numeric(20, 6);
  v_first_ledger_sequence bigint;
  v_published_candidate jsonb;
  v_local_submitted timestamp;
begin
  if p_command_version <> 'internal_paper_entry_command_v1'
    or p_fill_model_version <> 'internal_paper_immediate_costed_fill_v1'
    or p_owner_user_id is null
    or p_account_id is null
    or coalesce(length(p_scan_run_id), 0) = 0
    or coalesce(length(p_scan_run_fingerprint), 0) = 0
    or coalesce(length(p_snapshot_id), 0) = 0
    or coalesce(length(p_snapshot_fingerprint), 0) = 0
    or coalesce(length(p_candidate_identity), 0) = 0
    or coalesce(length(p_strategy_id), 0) = 0
    or coalesce(length(p_strategy_version), 0) = 0
    or coalesce(length(p_strategy_rollback_identity), 0) = 0
    or coalesce(length(p_symbol_selection_policy_id), 0) = 0
    or coalesce(length(p_symbol_selection_policy_version), 0) = 0
    or coalesce(length(p_observed_universe_version), 0) = 0
    or p_ticker !~ '^[A-Z][A-Z0-9.]{0,15}$'
    or p_quantity is null or p_quantity <= 0
    or p_arrival_price is null or p_arrival_price <= 0
    or p_stop_price is null or p_stop_price <= 0 or p_stop_price >= p_arrival_price
    or p_target_price is null or p_target_price <= p_arrival_price
    or p_submitted_at is null
  then
    raise exception 'invalid_internal_paper_entry_command';
  end if;

  select * into v_account
  from public.internal_paper_accounts
  where id = p_account_id
    and owner_user_id = p_owner_user_id
  for update;

  if not found then
    raise exception 'internal_paper_account_not_found';
  end if;

  v_command_key := encode(
    extensions.digest(
      convert_to(
        concat_ws(
          ':',
          'internal_paper_entry_v1',
          p_scan_run_fingerprint,
          p_candidate_identity,
          p_snapshot_fingerprint
        ),
        'UTF8'
      ),
      'sha256'
    ),
    'hex'
  );

  v_command_digest := encode(
    extensions.digest(
      convert_to(
        jsonb_build_object(
          'account_id', p_account_id,
          'account_config_version', v_account.config_version,
          'arrival_price', p_arrival_price,
          'candidate_identity', p_candidate_identity,
          'command_version', p_command_version,
          'fill_model_version', p_fill_model_version,
          'observed_universe_version', p_observed_universe_version,
          'owner_user_id', p_owner_user_id,
          'quantity', p_quantity,
          'scan_run_fingerprint', p_scan_run_fingerprint,
          'scan_run_id', p_scan_run_id,
          'snapshot_fingerprint', p_snapshot_fingerprint,
          'snapshot_id', p_snapshot_id,
          'stop_price', p_stop_price,
          'strategy_id', p_strategy_id,
          'strategy_rollback_identity', p_strategy_rollback_identity,
          'strategy_version', p_strategy_version,
          'submitted_at', p_submitted_at,
          'symbol_selection_policy_id', p_symbol_selection_policy_id,
          'symbol_selection_policy_version', p_symbol_selection_policy_version,
          'target_price', p_target_price,
          'ticker', p_ticker
        )::text,
        'UTF8'
      ),
      'sha256'
    ),
    'hex'
  );

  select * into v_existing
  from public.internal_paper_entry_intents
  where account_id = p_account_id
    and command_key = v_command_key;

  if found then
    if v_existing.command_digest <> v_command_digest then
      raise exception 'internal_paper_entry_command_conflict';
    end if;

    select f.id, f.fill_price, f.total_cash_cost
      into v_fill_id, v_fill_price, v_total_cash_cost
    from public.internal_paper_fills f
    where f.intent_id = v_existing.id
      and f.fill_sequence = 1;

    select p.id into v_position_id
    from public.internal_paper_positions p
    where p.intent_id = v_existing.id;

    if v_fill_id is null or v_position_id is null then
      raise exception 'internal_paper_entry_replay_state_incomplete';
    end if;

    intent_id := v_existing.id;
    fill_id := v_fill_id;
    position_id := v_position_id;
    disposition := 'reused';
    account_state_version := v_account.state_version;
    cash_balance := v_account.cash_balance;
    fill_price := v_fill_price;
    total_cash_cost := v_total_cash_cost;
    select count(*)::integer into ledger_entry_count
    from public.internal_paper_ledger_entries l
    where l.intent_id = v_existing.id;
    return next;
    return;
  end if;

  if v_account.status <> 'ready' then
    raise exception 'internal_paper_account_not_ready';
  end if;

  if v_account.fill_model_version <> p_fill_model_version
    or v_account.strategy_id <> p_strategy_id
    or v_account.strategy_version <> p_strategy_version
    or v_account.strategy_rollback_identity <> p_strategy_rollback_identity
    or v_account.symbol_selection_policy_id <> p_symbol_selection_policy_id
    or v_account.symbol_selection_policy_version <> p_symbol_selection_policy_version
    or v_account.observed_universe_version <> p_observed_universe_version
    or not (p_ticker = any(v_account.eligible_symbols))
  then
    raise exception 'internal_paper_account_scope_mismatch';
  end if;

  if exists (
    select 1 from public.internal_paper_positions
    where account_id = p_account_id and status = 'open'
  ) then
    raise exception 'internal_paper_open_position_limit_reached';
  end if;

  select * into v_scan_run
  from public.recommendation_scan_runs
  where id = p_scan_run_id
    and owner_user_id = p_owner_user_id
    and run_fingerprint = p_scan_run_fingerprint
  for share;

  if not found then
    raise exception 'internal_paper_decision_not_found';
  end if;

  v_decision_evidence_digest := encode(
    extensions.digest(
      convert_to(
        (v_scan_run.payload_json #> '{candidate_decision_record}')::text,
        'UTF8'
      ),
      'sha256'
    ),
    'hex'
  );

  if v_scan_run.payload_json #>> '{candidate_decision_record,record_version}' <> 'candidate_decision_record_v3'
    or v_scan_run.payload_json #>> '{candidate_decision_record,scan_run_id}' <> p_scan_run_id
    or v_scan_run.payload_json #>> '{candidate_decision_record,scan_run_fingerprint}' <> p_scan_run_fingerprint
    or v_scan_run.payload_json #>> '{candidate_decision_record,final_decision,disposition}' <> 'recommendations_published'
    or v_scan_run.payload_json #>> '{decision_lineage_receipt,status}' <> 'reconstructable'
    or v_scan_run.payload_json #>> '{candidate_decision_record,strategy_reference,strategy_id}' <> p_strategy_id
    or v_scan_run.payload_json #>> '{candidate_decision_record,strategy_reference,strategy_version}' <> p_strategy_version
    or v_scan_run.payload_json #>> '{candidate_decision_record,strategy_reference,rollback_identity}' <> p_strategy_rollback_identity
    or v_scan_run.payload_json #>> '{candidate_decision_record,strategy_reference,symbol_selection,policy_id}' <> p_symbol_selection_policy_id
    or v_scan_run.payload_json #>> '{candidate_decision_record,strategy_reference,symbol_selection,policy_version}' <> p_symbol_selection_policy_version
    or v_scan_run.payload_json #>> '{candidate_decision_record,strategy_reference,symbol_selection,observed_universe_version}' <> p_observed_universe_version
    or v_scan_run.payload_json #>> '{candidate_decision_record,coverage,full_membership_captured}' <> 'true'
  then
    raise exception 'internal_paper_decision_not_reconstructable';
  end if;

  if jsonb_typeof(v_scan_run.payload_json #> '{candidate_decision_record,candidates}') <> 'array' then
    raise exception 'internal_paper_decision_candidates_invalid';
  end if;

  select candidate into v_published_candidate
  from jsonb_array_elements(
    v_scan_run.payload_json #> '{candidate_decision_record,candidates}'
  ) candidate
  where candidate ->> 'candidate_id' = p_candidate_identity
    and candidate ->> 'ticker' = p_ticker
  limit 1;

  if v_published_candidate is null
    or v_published_candidate ->> 'disposition' <> 'published'
    or v_published_candidate ->> 'eligibility' <> 'eligible'
    or v_published_candidate #>> '{ranking,selected}' <> 'true'
    or v_published_candidate #>> '{build,built}' <> 'true'
    or v_published_candidate #>> '{data,freshness}' <> 'fresh'
    or coalesce(v_published_candidate #>> '{data,provider_source}', '') = ''
    or coalesce(v_published_candidate #>> '{data,source_timestamp}', '') = ''
    or (v_published_candidate #>> '{data,source_timestamp}')::timestamptz >
      (v_scan_run.payload_json #>> '{candidate_decision_record,decision_timestamp}')::timestamptz
  then
    raise exception 'internal_paper_candidate_not_tradeable';
  end if;

  select * into v_snapshot
  from public.recommendation_snapshots
  where id = p_snapshot_id
    and owner_user_id = p_owner_user_id
    and snapshot_fingerprint = p_snapshot_fingerprint
  for share;

  if not found
    or v_snapshot.scan_run_id <> p_scan_run_fingerprint
    or v_snapshot.ticker <> p_ticker
    or v_snapshot.status <> 'visible'
    or v_snapshot.source_mode <> 'supabase'
    or v_snapshot.data_mode <> 'live'
    or v_snapshot.recommended_at is distinct from p_submitted_at
    or v_snapshot.entry is distinct from p_arrival_price
    or v_snapshot.stop is distinct from p_stop_price
    or v_snapshot.target is distinct from p_target_price
  then
    raise exception 'internal_paper_snapshot_mismatch';
  end if;

  v_local_submitted := p_submitted_at at time zone 'America/New_York';
  if extract(isodow from v_local_submitted) > 5
    or v_local_submitted::time < time '09:30:00'
    or v_local_submitted::time >= time '16:00:00'
    or v_scan_run.trading_date is distinct from v_local_submitted::date
  then
    raise exception 'internal_paper_outside_regular_session';
  end if;

  v_spread_cost := round(
    p_arrival_price * p_quantity * (v_account.spread_bps / 2) / 10000,
    6
  );
  v_slippage_cost := round(
    p_arrival_price * p_quantity * v_account.slippage_bps / 10000,
    6
  );
  v_fill_price := round(
    p_arrival_price * (1 + ((v_account.spread_bps / 2) + v_account.slippage_bps) / 10000),
    6
  );
  v_notional := round(v_fill_price * p_quantity, 6);
  v_total_cash_cost := v_notional + v_account.commission_per_order;
  v_risk_at_stop := round(
    (v_fill_price - p_stop_price) * p_quantity + v_account.commission_per_order,
    6
  );

  if v_fill_price <= p_stop_price
    or v_total_cash_cost > v_account.cash_balance
    or v_risk_at_stop > v_account.per_trade_risk_cap
  then
    raise exception 'internal_paper_entry_risk_rejected';
  end if;

  insert into public.internal_paper_entry_intents (
    owner_user_id,
    account_id,
    command_key,
    command_digest,
    command_version,
    decision_scan_run_id,
    decision_scan_run_fingerprint,
    decision_evidence_digest,
    candidate_identity,
    snapshot_id,
    snapshot_fingerprint,
    strategy_id,
    strategy_version,
    strategy_rollback_identity,
    symbol_selection_policy_id,
    symbol_selection_policy_version,
    observed_universe_version,
    ticker,
    quantity,
    arrival_price,
    stop_price,
    target_price,
    fill_model_version,
    account_config_version,
    submitted_at
  ) values (
    p_owner_user_id,
    p_account_id,
    v_command_key,
    v_command_digest,
    p_command_version,
    p_scan_run_id,
    p_scan_run_fingerprint,
    v_decision_evidence_digest,
    p_candidate_identity,
    p_snapshot_id,
    p_snapshot_fingerprint,
    p_strategy_id,
    p_strategy_version,
    p_strategy_rollback_identity,
    p_symbol_selection_policy_id,
    p_symbol_selection_policy_version,
    p_observed_universe_version,
    p_ticker,
    p_quantity,
    p_arrival_price,
    p_stop_price,
    p_target_price,
    p_fill_model_version,
    v_account.config_version,
    p_submitted_at
  ) returning id into intent_id;

  insert into public.internal_paper_fills (
    owner_user_id,
    account_id,
    intent_id,
    quantity,
    arrival_price,
    fill_price,
    spread_cost,
    slippage_cost,
    commission,
    notional,
    total_cash_cost,
    filled_at
  ) values (
    p_owner_user_id,
    p_account_id,
    intent_id,
    p_quantity,
    p_arrival_price,
    v_fill_price,
    v_spread_cost,
    v_slippage_cost,
    v_account.commission_per_order,
    v_notional,
    v_total_cash_cost,
    p_submitted_at
  ) returning id into v_fill_id;

  insert into public.internal_paper_positions (
    owner_user_id,
    account_id,
    intent_id,
    entry_fill_id,
    ticker,
    quantity,
    average_entry_price,
    cost_basis,
    stop_price,
    target_price,
    opened_at
  ) values (
    p_owner_user_id,
    p_account_id,
    intent_id,
    v_fill_id,
    p_ticker,
    p_quantity,
    v_fill_price,
    v_notional,
    p_stop_price,
    p_target_price,
    p_submitted_at
  ) returning id into v_position_id;

  v_first_ledger_sequence := v_account.state_version * 3 + 1;
  insert into public.internal_paper_ledger_entries (
    owner_user_id,
    account_id,
    ledger_sequence,
    intent_id,
    fill_id,
    account_bucket,
    amount,
    occurred_at
  ) values
    (
      p_owner_user_id, p_account_id, v_first_ledger_sequence,
      intent_id, v_fill_id, 'cash', -v_total_cash_cost, p_submitted_at
    ),
    (
      p_owner_user_id, p_account_id, v_first_ledger_sequence + 1,
      intent_id, v_fill_id, 'position_cost_basis', v_notional, p_submitted_at
    ),
    (
      p_owner_user_id, p_account_id, v_first_ledger_sequence + 2,
      intent_id, v_fill_id, 'execution_cost_expense',
      v_account.commission_per_order, p_submitted_at
    );

  update public.internal_paper_accounts as account
  set cash_balance = account.cash_balance - v_total_cash_cost,
      state_version = account.state_version + 1,
      updated_at = now()
  where account.id = p_account_id
    and account.owner_user_id = p_owner_user_id
  returning account.state_version, account.cash_balance
    into account_state_version, cash_balance;

  fill_id := v_fill_id;
  position_id := v_position_id;
  disposition := 'created';
  fill_price := v_fill_price;
  total_cash_cost := v_total_cash_cost;
  ledger_entry_count := 3;
  return next;
end;
$$;

revoke all on function public.app_apply_internal_paper_entry_v1(
  uuid, uuid, text, text, text, text, text, text, text, text,
  text, text, text, text, bigint, numeric, numeric, numeric, timestamptz,
  text, text
) from public, anon, authenticated;
grant execute on function public.app_apply_internal_paper_entry_v1(
  uuid, uuid, text, text, text, text, text, text, text, text,
  text, text, text, text, bigint, numeric, numeric, numeric, timestamptz,
  text, text
) to service_role;

create or replace function public.app_read_internal_paper_account_v1(
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
  if p_read_version <> 'internal_paper_readback_v1'
    or p_owner_user_id is null
    or p_account_id is null
  then
    raise exception 'invalid_internal_paper_readback_command';
  end if;

  select jsonb_build_object(
    'readback_version', 'internal_paper_readback_v1',
    'account_id', a.id,
    'owner_user_id', a.owner_user_id,
    'status', a.status,
    'config_version', a.config_version,
    'state_version', a.state_version,
    'starting_cash', a.starting_cash,
    'cash_balance', a.cash_balance,
    'open_positions', coalesce((
      select jsonb_agg(to_jsonb(p) order by p.opened_at, p.id)
      from public.internal_paper_positions p
      where p.account_id = a.id and p.owner_user_id = a.owner_user_id
        and p.status = 'open'
    ), '[]'::jsonb),
    'latest_intent', (
      select to_jsonb(i)
      from public.internal_paper_entry_intents i
      where i.account_id = a.id and i.owner_user_id = a.owner_user_id
      order by i.created_at desc, i.id desc
      limit 1
    ),
    'latest_fill', (
      select to_jsonb(f)
      from public.internal_paper_fills f
      where f.account_id = a.id and f.owner_user_id = a.owner_user_id
      order by f.filled_at desc, f.id desc
      limit 1
    ),
    'ledger_entry_count', (
      select count(*) from public.internal_paper_ledger_entries l
      where l.account_id = a.id and l.owner_user_id = a.owner_user_id
    ),
    'ledger_balance', coalesce((
      select sum(l.amount) from public.internal_paper_ledger_entries l
      where l.account_id = a.id and l.owner_user_id = a.owner_user_id
    ), 0)
  ) into v_result
  from public.internal_paper_accounts a
  where a.id = p_account_id
    and a.owner_user_id = p_owner_user_id;

  if v_result is null then
    raise exception 'internal_paper_account_not_found';
  end if;

  return v_result;
end;
$$;

revoke all on function public.app_read_internal_paper_account_v1(
  uuid, uuid, text
) from public, anon, authenticated;
grant execute on function public.app_read_internal_paper_account_v1(
  uuid, uuid, text
) to service_role;

comment on table public.internal_paper_accounts is
  'SV-C experimental internal-paper accounts. No account row is created or enabled by this migration.';
comment on function public.app_apply_internal_paper_entry_v1(
  uuid, uuid, text, text, text, text, text, text, text, text,
  text, text, text, text, bigint, numeric, numeric, numeric, timestamptz,
  text, text
) is
  'SV-C1 brokerless atomic decision-to-intent-to-costed-fill-to-ledger command with exact retry semantics.';
