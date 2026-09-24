-- A.2: permit the trusted server boundary to verify whether a normal Basic
-- Free scan can be armed, without restoring direct ledger-table access.
--
-- This is deliberately a bounded, read-only aggregate. It cannot claim,
-- begin, finalize, release, or otherwise mutate a reservation, and it does
-- not expose reservation, attempt, user, or provider identifiers.

create or replace function public.read_basic_free_scheduled_scan_preflight(
  p_owner_user_id uuid,
  p_trading_date date,
  p_target_slot_utc timestamptz
)
returns table (
  preflight_version text,
  trading_date date,
  target_slot_utc text,
  total_reservation_count bigint,
  total_reserved_credits bigint,
  normal_scan_reservation_count bigint,
  normal_scan_reserved_credits bigint,
  active_reservation_count bigint,
  active_reserved_credits bigint,
  catalog_observation_reservation_count bigint,
  minimum_declared_daily_credit_budget smallint,
  maximum_declared_daily_credit_budget smallint,
  minimum_declared_per_minute_credit_budget smallint,
  maximum_declared_per_minute_credit_budget smallint,
  target_slot_attempt_count bigint,
  unresolved_scheduled_attempt_count bigint
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  with valid_input as (
    select
      p_owner_user_id as owner_user_id,
      p_trading_date as trading_date,
      p_target_slot_utc as target_slot_utc
    where p_owner_user_id is not null
      and p_trading_date is not null
      and p_target_slot_utc is not null
      -- Anchor the boundary in UTC rather than the database session timezone.
      and date_bin(
        '15 minutes'::interval,
        p_target_slot_utc,
        '1970-01-01 00:00:00+00'::timestamptz
      ) = p_target_slot_utc
  ), reservations as (
    select reservation.*
    from public.basic_free_discovery_credit_reservations as reservation
    join valid_input as input
      on reservation.owner_user_id = input.owner_user_id
     and reservation.trading_date = input.trading_date
  ), reservation_summary as (
    select
      count(*)::bigint as total_reservation_count,
      coalesce(sum(requested_credits), 0)::bigint as total_reserved_credits,
      count(*) filter (where not catalog_observation)::bigint
        as normal_scan_reservation_count,
      coalesce(sum(requested_credits) filter (where not catalog_observation), 0)::bigint
        as normal_scan_reserved_credits,
      count(*) filter (where status in ('claimed', 'attempted'))::bigint
        as active_reservation_count,
      coalesce(sum(requested_credits) filter (where status in ('claimed', 'attempted')), 0)::bigint
        as active_reserved_credits,
      count(*) filter (where catalog_observation)::bigint
        as catalog_observation_reservation_count,
      min(declared_daily_credit_budget)::smallint
        as minimum_declared_daily_credit_budget,
      max(declared_daily_credit_budget)::smallint
        as maximum_declared_daily_credit_budget,
      min(declared_per_minute_credit_budget)::smallint
        as minimum_declared_per_minute_credit_budget,
      max(declared_per_minute_credit_budget)::smallint
        as maximum_declared_per_minute_credit_budget
    from reservations
  ), attempt_summary as (
    select
      count(*) filter (
        where attempts.payload_json ->> 'scheduled_slot_started_at_utc'
          = to_char(
            input.target_slot_utc at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
          )
      )::bigint as target_slot_attempt_count,
      count(*) filter (
        where attempts.outcome in ('route_received', 'scheduled_function_fired')
      )::bigint as unresolved_scheduled_attempt_count
    from valid_input as input
    left join public.scheduled_scan_attempts as attempts
      on attempts.trading_date = input.trading_date
  )
  select
    'basic_free_scheduled_scan_preflight_v1'::text,
    input.trading_date,
    to_char(
      input.target_slot_utc at time zone 'UTC',
      'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
    ),
    reservations.total_reservation_count,
    reservations.total_reserved_credits,
    reservations.normal_scan_reservation_count,
    reservations.normal_scan_reserved_credits,
    reservations.active_reservation_count,
    reservations.active_reserved_credits,
    reservations.catalog_observation_reservation_count,
    reservations.minimum_declared_daily_credit_budget,
    reservations.maximum_declared_daily_credit_budget,
    reservations.minimum_declared_per_minute_credit_budget,
    reservations.maximum_declared_per_minute_credit_budget,
    attempts.target_slot_attempt_count,
    attempts.unresolved_scheduled_attempt_count
  from valid_input as input
  cross join reservation_summary as reservations
  cross join attempt_summary as attempts;
$$;

revoke all on function public.read_basic_free_scheduled_scan_preflight(uuid, date, timestamptz)
from public, anon, authenticated;

grant execute on function public.read_basic_free_scheduled_scan_preflight(uuid, date, timestamptz)
to service_role;

comment on function public.read_basic_free_scheduled_scan_preflight(uuid, date, timestamptz) is
  'A.2 bounded read-only service-role RPC. It returns only aggregate reservation and scheduled-attempt facts for one owner, New York trading date and quarter-hour target slot; it never mutates claims, calls a provider or exposes ledger identities.';
