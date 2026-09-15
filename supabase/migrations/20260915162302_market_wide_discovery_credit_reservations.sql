-- IF-2: reserve dynamic-mover credits before provider execution. The ledger is
-- deliberately server-owned: a reservation is never released automatically,
-- because a timeout or process failure can still have reached the provider.
begin;

create table if not exists public.market_wide_discovery_credit_reservations (
  id uuid primary key default gen_random_uuid(),
  contract_version text not null default 'market_wide_discovery_credit_reservation_v1',
  claim_id text not null unique,
  execution_fingerprint text not null unique,
  owner_user_id uuid not null,
  trading_date date not null,
  requested_credits smallint not null,
  declared_daily_credit_budget smallint not null,
  status text not null default 'claimed',
  provider_attempted boolean not null default false,
  finalized_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint market_wide_discovery_credit_reservations_contract_check
    check (contract_version = 'market_wide_discovery_credit_reservation_v1'),
  constraint market_wide_discovery_credit_reservations_credit_check
    check (
      requested_credits between 100 and 1000
      and mod(requested_credits, 100) = 0
      and declared_daily_credit_budget between requested_credits and 1000
      and mod(declared_daily_credit_budget, 100) = 0
    ),
  constraint market_wide_discovery_credit_reservations_status_check
    check (status in ('claimed', 'attempted', 'completed', 'failed')),
  constraint market_wide_discovery_credit_reservations_length_check
    check (
      length(claim_id) between 1 and 128
      and length(execution_fingerprint) between 1 and 240
    )
);

create index if not exists market_wide_discovery_credit_reservations_daily_usage_idx
  on public.market_wide_discovery_credit_reservations (
    owner_user_id,
    trading_date,
    created_at
  );

alter table public.market_wide_discovery_credit_reservations enable row level security;
revoke all on table public.market_wide_discovery_credit_reservations from public, anon, authenticated, service_role;

create or replace function public.claim_market_wide_discovery_credit_reservation(
  p_claim_id text,
  p_execution_fingerprint text,
  p_owner_user_id uuid,
  p_trading_date date,
  p_requested_credits smallint,
  p_declared_daily_credit_budget smallint,
  p_expected_contract_version text
)
returns table (
  claim_status text,
  claim_id text,
  reservation_status text,
  idempotent boolean,
  reserved_credits smallint,
  remaining_credits smallint,
  blocker text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  existing public.market_wide_discovery_credit_reservations%rowtype;
  current_reserved integer;
  remaining integer;
  locked_daily_budget integer;
  highest_daily_budget integer;
begin
  if p_expected_contract_version <> 'market_wide_discovery_credit_reservation_v1'
     or p_claim_id is null
     or p_execution_fingerprint is null
     or p_owner_user_id is null
     or p_trading_date is null
     or length(p_claim_id) not between 1 and 128
     or length(p_execution_fingerprint) not between 1 and 240
     or p_requested_credits not between 100 and 1000
     or mod(p_requested_credits, 100) <> 0
     or p_declared_daily_credit_budget not between p_requested_credits and 1000
     or mod(p_declared_daily_credit_budget, 100) <> 0 then
    return query select 'unavailable'::text, null::text, null::text, false, null::smallint, null::smallint, 'reservation_contract_invalid'::text;
    return;
  end if;

  perform pg_advisory_xact_lock(
    hashtext(
      'market_wide_discovery_credit_reservation:'
      || p_owner_user_id::text
      || ':'
      || p_trading_date::text
    )
  );

  select * into existing
  from public.market_wide_discovery_credit_reservations
  where execution_fingerprint = p_execution_fingerprint;

  if found then
    if existing.claim_id = p_claim_id
       and existing.owner_user_id = p_owner_user_id
       and existing.trading_date = p_trading_date
       and existing.requested_credits = p_requested_credits
       and existing.declared_daily_credit_budget = p_declared_daily_credit_budget
       and existing.contract_version = p_expected_contract_version then
      select coalesce(sum(requested_credits), 0)::integer
      into current_reserved
      from public.market_wide_discovery_credit_reservations
      where owner_user_id = p_owner_user_id
        and trading_date = p_trading_date;
      remaining := greatest(0, p_declared_daily_credit_budget - current_reserved);
      return query select 'claimed'::text, existing.claim_id, existing.status, true, current_reserved::smallint, remaining::smallint, null::text;
    else
      return query select 'unavailable'::text, null::text, null::text, false, null::smallint, null::smallint, 'execution_fingerprint_conflict'::text;
    end if;
    return;
  end if;

  select coalesce(sum(requested_credits), 0)::integer
  into current_reserved
  from public.market_wide_discovery_credit_reservations
  where owner_user_id = p_owner_user_id
    and trading_date = p_trading_date;

  select min(declared_daily_credit_budget)::integer,
         max(declared_daily_credit_budget)::integer
  into locked_daily_budget, highest_daily_budget
  from public.market_wide_discovery_credit_reservations
  where owner_user_id = p_owner_user_id
    and trading_date = p_trading_date;

  -- A day is governed by the first admitted budget. A mid-day environment
  -- change must not silently expand (or make ambiguous) the spend ceiling.
  if locked_daily_budget is not null
     and (locked_daily_budget <> highest_daily_budget
          or p_declared_daily_credit_budget <> locked_daily_budget) then
    return query select 'unavailable'::text, null::text, null::text, false, current_reserved::smallint, null::smallint, 'daily_credit_budget_changed'::text;
    return;
  end if;

  if current_reserved + p_requested_credits > p_declared_daily_credit_budget then
    remaining := greatest(0, p_declared_daily_credit_budget - current_reserved);
    return query select 'daily_credit_limit_reached'::text, null::text, null::text, false, current_reserved::smallint, remaining::smallint, 'daily_credit_limit_reached'::text;
    return;
  end if;

  insert into public.market_wide_discovery_credit_reservations (
    claim_id,
    execution_fingerprint,
    owner_user_id,
    trading_date,
    requested_credits,
    declared_daily_credit_budget
  ) values (
    p_claim_id,
    p_execution_fingerprint,
    p_owner_user_id,
    p_trading_date,
    p_requested_credits,
    p_declared_daily_credit_budget
  );

  return query select 'claimed'::text, p_claim_id, 'claimed'::text, false, (current_reserved + p_requested_credits)::smallint, (p_declared_daily_credit_budget - current_reserved - p_requested_credits)::smallint, null::text;
exception when unique_violation then
  return query select 'unavailable'::text, null::text, null::text, false, null::smallint, null::smallint, 'reservation_conflict'::text;
end;
$$;

create or replace function public.begin_market_wide_discovery_credit_reservation_attempt(
  p_claim_id text,
  p_execution_fingerprint text,
  p_expected_contract_version text
)
returns table (
  attempt_status text,
  claim_id text,
  reservation_status text,
  blocker text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  existing public.market_wide_discovery_credit_reservations%rowtype;
begin
  if p_expected_contract_version <> 'market_wide_discovery_credit_reservation_v1'
     or p_claim_id is null
     or p_execution_fingerprint is null
     or length(p_claim_id) not between 1 and 128
     or length(p_execution_fingerprint) not between 1 and 240 then
    return query select 'unavailable'::text, null::text, null::text, 'reservation_contract_invalid'::text;
    return;
  end if;

  update public.market_wide_discovery_credit_reservations as reservation
  set status = 'attempted',
      provider_attempted = true
  where reservation.claim_id = p_claim_id
    and reservation.execution_fingerprint = p_execution_fingerprint
    and reservation.contract_version = p_expected_contract_version
    and reservation.status = 'claimed'
  returning * into existing;

  if found then
    return query select 'attempt_started'::text, existing.claim_id, existing.status, null::text;
    return;
  end if;

  select * into existing
  from public.market_wide_discovery_credit_reservations as reservation
  where reservation.claim_id = p_claim_id
  for update;

  if not found
     or existing.execution_fingerprint <> p_execution_fingerprint
     or existing.contract_version <> p_expected_contract_version then
    return query select 'unavailable'::text, null::text, null::text, 'reservation_identity_unavailable'::text;
    return;
  end if;

  case existing.status
    when 'attempted' then
      return query select 'attempt_in_progress'::text, existing.claim_id, existing.status, 'attempt_in_progress'::text;
    when 'completed' then
      return query select 'already_completed'::text, existing.claim_id, existing.status, 'already_completed'::text;
    when 'failed' then
      return query select 'already_failed'::text, existing.claim_id, existing.status, 'already_failed'::text;
    else
      return query select 'unavailable'::text, null::text, null::text, 'reservation_state_unavailable'::text;
  end case;
end;
$$;

create or replace function public.finalize_market_wide_discovery_credit_reservation_attempt(
  p_claim_id text,
  p_execution_fingerprint text,
  p_expected_contract_version text,
  p_terminal_status text,
  p_finalized_at timestamptz
)
returns table (
  finalization_status text,
  claim_id text,
  reservation_status text,
  blocker text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  existing public.market_wide_discovery_credit_reservations%rowtype;
begin
  update public.market_wide_discovery_credit_reservations as reservation
  set status = p_terminal_status,
      finalized_at = p_finalized_at
  where reservation.claim_id = p_claim_id
    and reservation.execution_fingerprint = p_execution_fingerprint
    and reservation.contract_version = p_expected_contract_version
    and reservation.status = 'attempted'
    and p_terminal_status in ('completed', 'failed')
    and p_finalized_at is not null
  returning * into existing;

  if found then
    return query select 'finalized'::text, existing.claim_id, existing.status, null::text;
    return;
  end if;

  select * into existing
  from public.market_wide_discovery_credit_reservations as reservation
  where reservation.claim_id = p_claim_id
  for update;

  if not found
     or existing.execution_fingerprint <> p_execution_fingerprint
     or existing.contract_version <> p_expected_contract_version then
    return query select 'unavailable'::text, null::text, null::text, 'reservation_identity_unavailable'::text;
    return;
  end if;

  if existing.status = 'completed' then
    return query select 'already_completed'::text, existing.claim_id, existing.status, null::text;
  end if;
  if existing.status = 'failed' then
    return query select 'already_failed'::text, existing.claim_id, existing.status, null::text;
  end if;
  return query select 'invalid_transition'::text, existing.claim_id, existing.status, 'invalid_transition'::text;
end;
$$;

revoke all on function public.claim_market_wide_discovery_credit_reservation(text, text, uuid, date, smallint, smallint, text) from public, anon, authenticated;
revoke all on function public.begin_market_wide_discovery_credit_reservation_attempt(text, text, text) from public, anon, authenticated;
revoke all on function public.finalize_market_wide_discovery_credit_reservation_attempt(text, text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.claim_market_wide_discovery_credit_reservation(text, text, uuid, date, smallint, smallint, text) to service_role;
grant execute on function public.begin_market_wide_discovery_credit_reservation_attempt(text, text, text) to service_role;
grant execute on function public.finalize_market_wide_discovery_credit_reservation_attempt(text, text, text, text, timestamptz) to service_role;

comment on table public.market_wide_discovery_credit_reservations is
  'Server-owned IF-2 reservations for bounded Twelve Data market-mover discovery. Claims reserve estimated credits before the provider call and remain charged after timeout or failure.';

commit;
