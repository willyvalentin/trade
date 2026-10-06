-- Additive, aggregate-only compatibility for server-owned completed history.
-- Preserve both predecessor routines/OIDs/ACLs and every existing ledger row.
-- The predecessor's exact totals, active/terminal/window facts and attempts
-- remain authoritative; only the non-catalog category partition is corrected.
-- No provider invocation, activation, claim/refund or table rewrite occurs.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '15s';

create function public.read_basic_free_scheduled_scan_preflight_v3(
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
  catalog_observation_reservation_count bigint,
  catalog_observation_reserved_credits bigint,
  active_reservation_count bigint,
  active_reserved_credits bigint,
  terminal_reservation_count bigint,
  terminal_reserved_credits bigint,
  target_slot_reservation_count bigint,
  target_slot_reserved_credits bigint,
  minimum_declared_daily_credit_budget smallint,
  maximum_declared_daily_credit_budget smallint,
  minimum_declared_per_minute_credit_budget smallint,
  maximum_declared_per_minute_credit_budget smallint,
  target_slot_attempt_count bigint,
  unresolved_scheduled_attempt_count bigint,
  completed_history_reservation_count bigint,
  completed_history_reserved_credits bigint,
  unclassified_reservation_count bigint,
  unclassified_reserved_credits bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with predecessor as (
    select * from public.read_basic_free_scheduled_scan_preflight_v2(
      p_owner_user_id, p_trading_date, p_target_slot_utc
    )
  ), classified as (
    select requested_credits,
      case
        when catalog_observation and requested_credits = 1 then 'catalog'
        when not catalog_observation and requested_credits = 8 then 'scan'
        when not catalog_observation and requested_credits = 1
          and execution_fingerprint ~ (
            '^completed_session_history_preparation_v1\|' || p_owner_user_id::text ||
            '\|' || p_trading_date::text || '\|[A-Z][A-Z0-9.-]{0,11}$'
          ) then 'history'
        else 'unclassified'
      end as category
    from public.basic_free_discovery_credit_reservations
    where owner_user_id = p_owner_user_id and trading_date = p_trading_date
  ), categories as (
    select
      count(*) filter (where category = 'scan') as scan_count,
      coalesce(sum(requested_credits) filter (where category = 'scan'), 0)::bigint as scan_credits,
      count(*) filter (where category = 'catalog') as catalog_count,
      coalesce(sum(requested_credits) filter (where category = 'catalog'), 0)::bigint as catalog_credits,
      count(*) filter (where category = 'history') as history_count,
      coalesce(sum(requested_credits) filter (where category = 'history'), 0)::bigint as history_credits,
      count(*) filter (where category = 'unclassified') as unclassified_count,
      coalesce(sum(requested_credits) filter (where category = 'unclassified'), 0)::bigint as unclassified_credits
    from classified
  )
  select
    'basic_free_scheduled_scan_preflight_v3'::text,
    old.trading_date, old.target_slot_utc,
    old.total_reservation_count, old.total_reserved_credits,
    kinds.scan_count, kinds.scan_credits, kinds.catalog_count, kinds.catalog_credits,
    old.active_reservation_count, old.active_reserved_credits,
    old.terminal_reservation_count, old.terminal_reserved_credits,
    old.target_slot_reservation_count, old.target_slot_reserved_credits,
    old.minimum_declared_daily_credit_budget, old.maximum_declared_daily_credit_budget,
    old.minimum_declared_per_minute_credit_budget, old.maximum_declared_per_minute_credit_budget,
    old.target_slot_attempt_count, old.unresolved_scheduled_attempt_count,
    kinds.history_count, kinds.history_credits, kinds.unclassified_count, kinds.unclassified_credits
  from predecessor as old cross join categories as kinds;
$$;

revoke all on function public.read_basic_free_scheduled_scan_preflight_v3(uuid, date, timestamptz)
from public, anon, authenticated, service_role;
grant execute on function public.read_basic_free_scheduled_scan_preflight_v3(uuid, date, timestamptz)
to service_role;
comment on function public.read_basic_free_scheduled_scan_preflight_v3(uuid, date, timestamptz) is
  'Read-only owner/day aggregate: fixed eight-credit scans, one-credit catalog and owner/date-bound completed history are distinct; unknown claims stay charged and fail closed. Predecessor totals/window/attempt semantics are unchanged. No provider or activation authority.';

create function public.read_basic_free_observation_series_preflight_v2(
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
  unattributed_scheduled_attempt_count bigint,
  completed_history_reservation_count bigint,
  completed_history_reserved_credits bigint,
  unclassified_reservation_count bigint,
  unclassified_reserved_credits bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with predecessor as (
    select * from public.read_basic_free_observation_series_preflight_v1(
      p_owner_user_id, p_trading_date, p_starts_at_utc, p_expires_at_utc,
      p_max_attempts, p_max_provider_credits
    )
  ), classified as (
    select requested_credits,
      case
        when catalog_observation and requested_credits = 1 then 'catalog'
        when not catalog_observation and requested_credits = 8 then 'scan'
        when not catalog_observation and requested_credits = 1
          and execution_fingerprint ~ (
            '^completed_session_history_preparation_v1\|' || p_owner_user_id::text ||
            '\|' || p_trading_date::text || '\|[A-Z][A-Z0-9.-]{0,11}$'
          ) then 'history'
        else 'unclassified'
      end as category
    from public.basic_free_discovery_credit_reservations
    where owner_user_id = p_owner_user_id and trading_date = p_trading_date
  ), categories as (
    select
      count(*) filter (where category = 'scan') as scan_count,
      coalesce(sum(requested_credits) filter (where category = 'scan'), 0)::bigint as scan_credits,
      count(*) filter (where category = 'catalog') as catalog_count,
      coalesce(sum(requested_credits) filter (where category = 'catalog'), 0)::bigint as catalog_credits,
      count(*) filter (where category = 'history') as history_count,
      coalesce(sum(requested_credits) filter (where category = 'history'), 0)::bigint as history_credits,
      count(*) filter (where category = 'unclassified') as unclassified_count,
      coalesce(sum(requested_credits) filter (where category = 'unclassified'), 0)::bigint as unclassified_credits
    from classified
  )
  select
    'observation_series_activation_preflight_v2'::text,
    old.trading_date, old.starts_at_utc, old.expires_at_utc,
    old.available_slot_count, old.requested_max_attempts, old.requested_max_provider_credits,
    old.total_reservation_count, old.total_reserved_credits,
    kinds.scan_count, kinds.scan_credits, kinds.catalog_count, kinds.catalog_credits,
    old.active_reservation_count, old.active_reserved_credits,
    old.terminal_reservation_count, old.terminal_reserved_credits,
    old.window_reservation_count, old.window_reserved_credits,
    old.minimum_declared_daily_credit_budget, old.maximum_declared_daily_credit_budget,
    old.minimum_declared_per_minute_credit_budget, old.maximum_declared_per_minute_credit_budget,
    old.daily_scheduled_attempt_count, old.window_scheduled_attempt_count,
    old.window_distinct_attempt_slot_count, old.window_duplicate_attempt_slot_count,
    old.unresolved_scheduled_attempt_count, old.unattributed_scheduled_attempt_count,
    kinds.history_count, kinds.history_credits, kinds.unclassified_count, kinds.unclassified_credits
  from predecessor as old cross join categories as kinds;
$$;

revoke all on function public.read_basic_free_observation_series_preflight_v2(
  uuid, date, timestamptz, timestamptz, smallint, smallint
) from public, anon, authenticated, service_role;
grant execute on function public.read_basic_free_observation_series_preflight_v2(
  uuid, date, timestamptz, timestamptz, smallint, smallint
) to service_role;
comment on function public.read_basic_free_observation_series_preflight_v2(
  uuid, date, timestamptz, timestamptz, smallint, smallint
) is
  'Read-only owner/day series aggregate: completed-history credits remain charged without being counted as eight-credit scans. Unknown claims, active/window overlap and attempt lineage remain fail-closed; no provider, activation, publication or broker authority.';

commit;
