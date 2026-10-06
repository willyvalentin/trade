-- Fixed-purpose internal read API for the first prepared benchmark consumer.
-- The reservation ledger remains RPC-only: no table/column grant, claim,
-- finalization, row rewrite or provider authorization is added. This privileged
-- lookup is deliberately narrower than general reservation-table access.
begin;

create function public.read_prepared_benchmark_history_claims_v1(
  p_owner_user_id uuid,
  p_trading_date date
)
returns table (
  contract_version text,
  claim_id text,
  execution_fingerprint text,
  owner_user_id uuid,
  trading_date date,
  minute_bucket timestamptz,
  requested_credits smallint,
  status text,
  provider_attempted boolean,
  finalized_at timestamptz
)
language sql stable security definer
set search_path = ''
as $$
  select r.contract_version, r.claim_id, r.execution_fingerprint,
    r.owner_user_id, r.trading_date, r.minute_bucket, r.requested_credits,
    r.status, r.provider_attempted, r.finalized_at
  from public.basic_free_discovery_credit_reservations as r
  where p_owner_user_id is not null and p_trading_date is not null
    -- Service-only internal calls have no end-user auth.uid(). Retain an
    -- explicit request-principal gate as well as the EXECUTE ACL below.
    and current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role'
    and r.owner_user_id = p_owner_user_id
    and r.trading_date = p_trading_date
    and r.execution_fingerprint in (
      'completed_session_history_preparation_v1|' || p_owner_user_id::text || '|' || p_trading_date::text || '|SPY',
      'completed_session_history_preparation_v1|' || p_owner_user_id::text || '|' || p_trading_date::text || '|QQQ'
    )
  order by r.execution_fingerprint;
$$;

revoke all on function public.read_prepared_benchmark_history_claims_v1(uuid, date)
from public, anon, authenticated, service_role;
grant execute on function public.read_prepared_benchmark_history_claims_v1(uuid, date)
to service_role;
comment on function public.read_prepared_benchmark_history_claims_v1(uuid, date) is
  'Read-only internal owner/day lookup of the two fixed SPY/QQQ completed-history claim identities. No table access, new/replayed claim, finalization, history rewrite or provider authority; caller still validates original signed sources and terminal paid facts.';

commit;
