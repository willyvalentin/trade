-- One exact terminal history identity, not a general reservation-table reader.
-- No claim/finalization, refund, table grant, row rewrite or provider authority.
begin;

create function public.read_completed_history_terminal_failure_v1(
  p_owner_user_id uuid,
  p_trading_date date,
  p_ticker text,
  p_claim_id text
)
returns table (
  contract_version text,
  claim_id text,
  execution_fingerprint text,
  owner_user_id uuid,
  trading_date date,
  minute_bucket timestamptz,
  catalog_observation boolean,
  requested_credits smallint,
  declared_daily_credit_budget smallint,
  declared_per_minute_credit_budget smallint,
  status text,
  finalized_at timestamptz
)
language sql stable security definer
set search_path = ''
as $$
  select r.contract_version, r.claim_id, r.execution_fingerprint,
    r.owner_user_id, r.trading_date, r.minute_bucket, r.catalog_observation,
    r.requested_credits, r.declared_daily_credit_budget,
    r.declared_per_minute_credit_budget, r.status, r.finalized_at
  from public.basic_free_discovery_credit_reservations as r
  where p_owner_user_id is not null and p_trading_date is not null
    and length(p_ticker) between 1 and 16 and p_ticker ~ '^[A-Z][A-Z0-9.-]*$'
    and length(p_claim_id) between 1 and 128
    -- The internal service has no end-user auth.uid(). Require its request
    -- principal plus EXECUTE ACL, and bind every returned row to owner/day.
    and current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role'
    and r.owner_user_id = p_owner_user_id and r.trading_date = p_trading_date
    and r.claim_id = p_claim_id
    and r.execution_fingerprint = 'completed_session_history_preparation_v1|'
      || p_owner_user_id::text || '|' || p_trading_date::text || '|' || p_ticker
    and r.contract_version = 'basic_free_discovery_credit_reservation_v1'
    and r.catalog_observation = false and r.requested_credits = 1
    and r.status = 'failed' and r.finalized_at is not null;
$$;

revoke all on function public.read_completed_history_terminal_failure_v1(uuid, date, text, text)
from public, anon, authenticated, service_role;
grant execute on function public.read_completed_history_terminal_failure_v1(uuid, date, text, text)
to service_role;
comment on function public.read_completed_history_terminal_failure_v1(uuid, date, text, text) is
  'Read-only internal exact owner/day/ticker/claim lookup of a finalized failed one-credit completed-history identity. Caller must validate original minute, clock and budget and re-present the immutable claim to the unchanged claim RPC. No retry, refund, new claim or table access.';

commit;
