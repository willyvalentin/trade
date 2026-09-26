-- SV-A.2: one atomic, aggregate-only preflight for a complete bounded
-- observation-series window. This routine is read-only and cannot arm a
-- scheduler, reserve credits, invoke a provider, publish a recommendation or
-- create a paper/broker side effect.

create or replace function public.read_basic_free_observation_series_preflight_v1(
  p_owner_user_id uuid,
  p_trading_date date,
  p_starts_at_utc timestamptz,
  p_expires_at_utc timestamptz,
  p_max_attempts smallint,
  p_max_provider_credits smallint
)
returns table (
  preflight_version text,
  trading_date date,
  starts_at_utc text,
  expires_at_utc text,
  available_slot_count smallint,
  requested_max_attempts smallint,
  requested_max_provider_credits smallint,
  total_reservation_count bigint,
  total_reserved_credits bigint,
  normal_scan_reservation_count bigint,
  normal_scan_reserved_credits bigint,
  catalog_observation_reservation_count bigint,
  catalog_observation_reserved_credits bigint,
  active_reservation_count bigint,
  active_reserved_credits bigint,
  terminal_reservation_count bigint,
  terminal_reserved_credits bigint,
  window_reservation_count bigint,
  window_reserved_credits bigint,
  minimum_declared_daily_credit_budget smallint,
  maximum_declared_daily_credit_budget smallint,
  minimum_declared_per_minute_credit_budget smallint,
  maximum_declared_per_minute_credit_budget smallint,
  daily_scheduled_attempt_count bigint,
  window_scheduled_attempt_count bigint,
  window_distinct_attempt_slot_count bigint,
  window_duplicate_attempt_slot_count bigint,
  unresolved_scheduled_attempt_count bigint,
  unattributed_scheduled_attempt_count bigint
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
      p_starts_at_utc as starts_at_utc,
      p_expires_at_utc as expires_at_utc,
      p_max_attempts as max_attempts,
      p_max_provider_credits as max_provider_credits,
      (extract(epoch from (p_expires_at_utc - p_starts_at_utc)) / 900)::smallint
        as available_slot_count,
      to_char(
        p_starts_at_utc at time zone 'UTC',
        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
      ) as starts_at_text,
      to_char(
        p_expires_at_utc at time zone 'UTC',
        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
      ) as expires_at_text
    where p_owner_user_id is not null
      and p_trading_date is not null
      and p_starts_at_utc is not null
      and p_expires_at_utc is not null
      and p_max_attempts between 1 and 26
      and p_max_provider_credits between 8 and 208
      and mod(p_max_provider_credits, 8) = 0
      and p_max_provider_credits <= p_max_attempts * 8
      and date_bin(
        '15 minutes'::interval,
        p_starts_at_utc,
        '1970-01-01 00:00:00+00'::timestamptz
      ) = p_starts_at_utc
      and date_bin(
        '15 minutes'::interval,
        p_expires_at_utc,
        '1970-01-01 00:00:00+00'::timestamptz
      ) = p_expires_at_utc
      and p_expires_at_utc > p_starts_at_utc
      and p_expires_at_utc - p_starts_at_utc <= '390 minutes'::interval
      and p_max_attempts <=
        extract(epoch from (p_expires_at_utc - p_starts_at_utc)) / 900
      and (p_starts_at_utc at time zone 'America/New_York')::date
        = p_trading_date
      and (
        (p_expires_at_utc - '1 millisecond'::interval)
          at time zone 'America/New_York'
      )::date = p_trading_date
  ), reservations as (
    select
      reservation.*,
      input.starts_at_utc as requested_starts_at_utc,
      input.expires_at_utc as requested_expires_at_utc
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
      count(*) filter (where catalog_observation)::bigint
        as catalog_observation_reservation_count,
      coalesce(sum(requested_credits) filter (where catalog_observation), 0)::bigint
        as catalog_observation_reserved_credits,
      count(*) filter (where status in ('claimed', 'attempted'))::bigint
        as active_reservation_count,
      coalesce(sum(requested_credits) filter (where status in ('claimed', 'attempted')), 0)::bigint
        as active_reserved_credits,
      count(*) filter (where status in ('completed', 'failed'))::bigint
        as terminal_reservation_count,
      coalesce(sum(requested_credits) filter (where status in ('completed', 'failed')), 0)::bigint
        as terminal_reserved_credits,
      count(*) filter (
        where minute_bucket >= requested_starts_at_utc
          and minute_bucket < requested_expires_at_utc
      )::bigint as window_reservation_count,
      coalesce(sum(requested_credits) filter (
        where minute_bucket >= requested_starts_at_utc
          and minute_bucket < requested_expires_at_utc
      ), 0)::bigint as window_reserved_credits,
      min(declared_daily_credit_budget)::smallint
        as minimum_declared_daily_credit_budget,
      max(declared_daily_credit_budget)::smallint
        as maximum_declared_daily_credit_budget,
      min(declared_per_minute_credit_budget)::smallint
        as minimum_declared_per_minute_credit_budget,
      max(declared_per_minute_credit_budget)::smallint
        as maximum_declared_per_minute_credit_budget
    from reservations
  ), daily_attempts as (
    select
      attempt.attempt_fingerprint,
      attempt.outcome,
      attempt.payload_json ->> 'scheduled_slot_started_at_utc' as slot_text
    from public.scheduled_scan_attempts as attempt
    join valid_input as input
      on attempt.trading_date = input.trading_date
    where attempt.source = 'netlify_scheduled_function'
      and attempt.mode = 'scheduled'
  ), attempt_summary as (
    select
      count(attempt_fingerprint)::bigint as daily_scheduled_attempt_count,
      count(attempt_fingerprint) filter (
        where slot_text >= input.starts_at_text
          and slot_text < input.expires_at_text
      )::bigint as window_scheduled_attempt_count,
      count(distinct slot_text) filter (
        where slot_text >= input.starts_at_text
          and slot_text < input.expires_at_text
      )::bigint as window_distinct_attempt_slot_count,
      greatest(
        count(attempt_fingerprint) filter (
          where slot_text >= input.starts_at_text
            and slot_text < input.expires_at_text
        ) - count(distinct slot_text) filter (
          where slot_text >= input.starts_at_text
            and slot_text < input.expires_at_text
        ),
        0
      )::bigint as window_duplicate_attempt_slot_count,
      count(attempt_fingerprint) filter (
        where outcome in ('route_received', 'scheduled_function_fired')
      )::bigint as unresolved_scheduled_attempt_count,
      count(attempt_fingerprint) filter (
        where slot_text is null
          or slot_text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:(00|15|30|45):00[.]000Z$'
      )::bigint as unattributed_scheduled_attempt_count
    from valid_input as input
    left join daily_attempts on true
    group by input.starts_at_text, input.expires_at_text
  )
  select
    'observation_series_activation_preflight_v1'::text,
    input.trading_date,
    input.starts_at_text,
    input.expires_at_text,
    input.available_slot_count,
    input.max_attempts,
    input.max_provider_credits,
    reservations.total_reservation_count,
    reservations.total_reserved_credits,
    reservations.normal_scan_reservation_count,
    reservations.normal_scan_reserved_credits,
    reservations.catalog_observation_reservation_count,
    reservations.catalog_observation_reserved_credits,
    reservations.active_reservation_count,
    reservations.active_reserved_credits,
    reservations.terminal_reservation_count,
    reservations.terminal_reserved_credits,
    reservations.window_reservation_count,
    reservations.window_reserved_credits,
    reservations.minimum_declared_daily_credit_budget,
    reservations.maximum_declared_daily_credit_budget,
    reservations.minimum_declared_per_minute_credit_budget,
    reservations.maximum_declared_per_minute_credit_budget,
    attempts.daily_scheduled_attempt_count,
    attempts.window_scheduled_attempt_count,
    attempts.window_distinct_attempt_slot_count,
    attempts.window_duplicate_attempt_slot_count,
    attempts.unresolved_scheduled_attempt_count,
    attempts.unattributed_scheduled_attempt_count
  from valid_input as input
  cross join reservation_summary as reservations
  cross join attempt_summary as attempts;
$$;

revoke all on function public.read_basic_free_observation_series_preflight_v1(
  uuid, date, timestamptz, timestamptz, smallint, smallint
) from public, anon, authenticated;

grant execute on function public.read_basic_free_observation_series_preflight_v1(
  uuid, date, timestamptz, timestamptz, smallint, smallint
) to service_role;

comment on function public.read_basic_free_observation_series_preflight_v1(
  uuid, date, timestamptz, timestamptz, smallint, smallint
) is
  'Read-only, aggregate-only, owner-bound A.2 observation-series activation preflight. It grants no scheduler, provider, publication, paper or broker authority.';
