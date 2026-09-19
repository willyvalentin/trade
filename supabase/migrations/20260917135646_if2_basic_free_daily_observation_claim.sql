-- IF-2: a Basic Free /stocks catalog observation is a separate one-page,
-- one-credit admission. Its daily claim must survive an interrupted function
-- before the terminal receipt is persisted, without consuming the ordinary
-- Basic Free scheduled-scan ceiling that shares this reservation ledger.
begin;

alter table public.basic_free_discovery_credit_reservations
  add column if not exists catalog_observation boolean not null default false;

create unique index if not exists
  basic_free_discovery_credit_reservations_catalog_day_uq_idx
  on public.basic_free_discovery_credit_reservations (owner_user_id, trading_date)
  where catalog_observation;

create or replace function public.claim_basic_free_discovery_credit_reservation(
  p_claim_id text,
  p_execution_fingerprint text,
  p_owner_user_id uuid,
  p_trading_date date,
  p_minute_bucket timestamptz,
  p_catalog_observation boolean,
  p_requested_credits smallint,
  p_declared_daily_credit_budget smallint,
  p_declared_per_minute_credit_budget smallint,
  p_expected_contract_version text
)
returns table (
  claim_status text,
  claim_id text,
  reservation_status text,
  idempotent boolean,
  daily_reserved_credits smallint,
  daily_remaining_credits smallint,
  minute_reserved_credits smallint,
  minute_remaining_credits smallint,
  blocker text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  existing public.basic_free_discovery_credit_reservations%rowtype;
  current_daily_reserved integer;
  current_minute_reserved integer;
  daily_remaining integer;
  minute_remaining integer;
  locked_daily_budget integer;
  highest_daily_budget integer;
  locked_minute_budget integer;
  highest_minute_budget integer;
begin
  if p_expected_contract_version <> 'basic_free_discovery_credit_reservation_v1'
     or p_claim_id is null
     or p_execution_fingerprint is null
     or p_owner_user_id is null
     or p_trading_date is null
     or p_minute_bucket is null
     or p_catalog_observation is null
     or date_trunc('minute', p_minute_bucket) <> p_minute_bucket
     or length(p_claim_id) not between 1 and 128
     or length(p_execution_fingerprint) not between 1 and 240
     or p_requested_credits not between 1 and 8
     or p_declared_daily_credit_budget not between p_requested_credits and 800
     or p_declared_per_minute_credit_budget not between p_requested_credits and 8 then
    return query select 'unavailable'::text, null::text, null::text, false, null::smallint, null::smallint, null::smallint, null::smallint, 'reservation_contract_invalid'::text;
    return;
  end if;

  perform pg_advisory_xact_lock(
    hashtext(
      'basic_free_discovery_credit_reservation:daily:'
      || p_owner_user_id::text
      || ':'
      || p_trading_date::text
    )
  );
  perform pg_advisory_xact_lock(
    hashtext(
      'basic_free_discovery_credit_reservation:minute:'
      || p_owner_user_id::text
      || ':'
      || p_minute_bucket::text
    )
  );

  select * into existing
  from public.basic_free_discovery_credit_reservations
  where execution_fingerprint = p_execution_fingerprint;

  if found then
    if existing.claim_id = p_claim_id
       and existing.owner_user_id = p_owner_user_id
       and existing.trading_date = p_trading_date
       and existing.minute_bucket = p_minute_bucket
       and existing.catalog_observation = p_catalog_observation
       and existing.requested_credits = p_requested_credits
       and existing.declared_daily_credit_budget = p_declared_daily_credit_budget
       and existing.declared_per_minute_credit_budget = p_declared_per_minute_credit_budget
       and existing.contract_version = p_expected_contract_version then
      select coalesce(sum(requested_credits), 0)::integer
      into current_daily_reserved
      from public.basic_free_discovery_credit_reservations
      where owner_user_id = p_owner_user_id
        and trading_date = p_trading_date;
      select coalesce(sum(requested_credits), 0)::integer
      into current_minute_reserved
      from public.basic_free_discovery_credit_reservations
      where owner_user_id = p_owner_user_id
        and minute_bucket = p_minute_bucket;
      daily_remaining := greatest(0, p_declared_daily_credit_budget - current_daily_reserved);
      minute_remaining := greatest(0, p_declared_per_minute_credit_budget - current_minute_reserved);
      return query select 'claimed'::text, existing.claim_id, existing.status, true, current_daily_reserved::smallint, daily_remaining::smallint, current_minute_reserved::smallint, minute_remaining::smallint, null::text;
    else
      return query select 'unavailable'::text, null::text, null::text, false, null::smallint, null::smallint, null::smallint, null::smallint, 'execution_fingerprint_conflict'::text;
    end if;
    return;
  end if;

  select coalesce(sum(requested_credits), 0)::integer
  into current_daily_reserved
  from public.basic_free_discovery_credit_reservations
  where owner_user_id = p_owner_user_id
    and trading_date = p_trading_date;
  select coalesce(sum(requested_credits), 0)::integer
  into current_minute_reserved
  from public.basic_free_discovery_credit_reservations
  where owner_user_id = p_owner_user_id
    and minute_bucket = p_minute_bucket;

  if p_catalog_observation and exists (
    select 1
    from public.basic_free_discovery_credit_reservations
    where owner_user_id = p_owner_user_id
      and trading_date = p_trading_date
      and catalog_observation
  ) then
    daily_remaining := greatest(0, p_declared_daily_credit_budget - current_daily_reserved);
    minute_remaining := greatest(0, p_declared_per_minute_credit_budget - current_minute_reserved);
    return query select 'daily_catalog_observation_already_claimed'::text, null::text, null::text, false, current_daily_reserved::smallint, daily_remaining::smallint, current_minute_reserved::smallint, minute_remaining::smallint, 'daily_catalog_observation_already_claimed'::text;
    return;
  end if;

  select min(declared_daily_credit_budget)::integer,
         max(declared_daily_credit_budget)::integer
  into locked_daily_budget, highest_daily_budget
  from public.basic_free_discovery_credit_reservations
  where owner_user_id = p_owner_user_id
    and trading_date = p_trading_date;
  if locked_daily_budget is not null
     and (locked_daily_budget <> highest_daily_budget
          or p_declared_daily_credit_budget <> locked_daily_budget) then
    return query select 'unavailable'::text, null::text, null::text, false, current_daily_reserved::smallint, null::smallint, current_minute_reserved::smallint, null::smallint, 'daily_credit_budget_changed'::text;
    return;
  end if;

  select min(declared_per_minute_credit_budget)::integer,
         max(declared_per_minute_credit_budget)::integer
  into locked_minute_budget, highest_minute_budget
  from public.basic_free_discovery_credit_reservations
  where owner_user_id = p_owner_user_id
    and minute_bucket = p_minute_bucket;
  if locked_minute_budget is not null
     and (locked_minute_budget <> highest_minute_budget
          or p_declared_per_minute_credit_budget <> locked_minute_budget) then
    return query select 'unavailable'::text, null::text, null::text, false, current_daily_reserved::smallint, null::smallint, current_minute_reserved::smallint, null::smallint, 'per_minute_credit_budget_changed'::text;
    return;
  end if;

  if current_daily_reserved + p_requested_credits > p_declared_daily_credit_budget then
    daily_remaining := greatest(0, p_declared_daily_credit_budget - current_daily_reserved);
    minute_remaining := greatest(0, p_declared_per_minute_credit_budget - current_minute_reserved);
    return query select 'daily_credit_limit_reached'::text, null::text, null::text, false, current_daily_reserved::smallint, daily_remaining::smallint, current_minute_reserved::smallint, minute_remaining::smallint, 'daily_credit_limit_reached'::text;
    return;
  end if;

  if current_minute_reserved + p_requested_credits > p_declared_per_minute_credit_budget then
    daily_remaining := greatest(0, p_declared_daily_credit_budget - current_daily_reserved);
    minute_remaining := greatest(0, p_declared_per_minute_credit_budget - current_minute_reserved);
    return query select 'per_minute_credit_limit_reached'::text, null::text, null::text, false, current_daily_reserved::smallint, daily_remaining::smallint, current_minute_reserved::smallint, minute_remaining::smallint, 'per_minute_credit_limit_reached'::text;
    return;
  end if;

  insert into public.basic_free_discovery_credit_reservations (
    claim_id,
    execution_fingerprint,
    owner_user_id,
    trading_date,
    minute_bucket,
    catalog_observation,
    requested_credits,
    declared_daily_credit_budget,
    declared_per_minute_credit_budget
  ) values (
    p_claim_id,
    p_execution_fingerprint,
    p_owner_user_id,
    p_trading_date,
    p_minute_bucket,
    p_catalog_observation,
    p_requested_credits,
    p_declared_daily_credit_budget,
    p_declared_per_minute_credit_budget
  );

  return query select 'claimed'::text, p_claim_id, 'claimed'::text, false, (current_daily_reserved + p_requested_credits)::smallint, (p_declared_daily_credit_budget - current_daily_reserved - p_requested_credits)::smallint, (current_minute_reserved + p_requested_credits)::smallint, (p_declared_per_minute_credit_budget - current_minute_reserved - p_requested_credits)::smallint, null::text;
exception when unique_violation then
  return query select 'unavailable'::text, null::text, null::text, false, null::smallint, null::smallint, null::smallint, null::smallint, 'reservation_conflict'::text;
end;
$$;

revoke all on function public.claim_basic_free_discovery_credit_reservation(text, text, uuid, date, timestamptz, boolean, smallint, smallint, smallint, text) from public, anon, authenticated;
grant execute on function public.claim_basic_free_discovery_credit_reservation(text, text, uuid, date, timestamptz, boolean, smallint, smallint, smallint, text) to service_role;

comment on column public.basic_free_discovery_credit_reservations.catalog_observation is
  'True only for the separately bounded IF-2 Basic Free one-page /stocks catalog observation; normal scheduled-scan reservations remain false.';

comment on table public.basic_free_discovery_credit_reservations is
  'Server-owned IF-2 Basic Free credit reservations. Every reservation remains charged after timeout or failure; catalog_observation rows additionally enforce at most one /stocks page per owner and trading date, while normal scheduled scans retain their separate shared credit ceiling.';

commit;
