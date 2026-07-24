create or replace function public.admit_continuous_intelligence_shadow_canary_manual_execution(
  p_authorization_id text,
  p_authorization_token text,
  p_request_fingerprint text,
  p_execution_id text,
  p_claim_id text,
  p_utc_day date
)
returns table (
  admission_status text,
  authorization_id text,
  claim_id text,
  claim_status text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  authorization_row public.continuous_intelligence_shadow_canary_manual_authorizations%rowtype;
  claim_row public.continuous_intelligence_shadow_canary_daily_claims%rowtype;
  run_count integer;
  credit_count integer;
begin
  if p_utc_day is null or p_authorization_token is null or length(p_authorization_token) < 32 then
    return query select 'daily_usage_unavailable'::text, null::text, null::text, null::text;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext('continuous_intelligence_shadow_canary_manual_execution:' || p_utc_day::text));

  select * into authorization_row
  from public.continuous_intelligence_shadow_canary_manual_authorizations
  where continuous_intelligence_shadow_canary_manual_authorizations.authorization_id = p_authorization_id
  for update;

  if not found or authorization_row.request_fingerprint <> p_request_fingerprint or
     authorization_row.execution_id <> p_execution_id or authorization_row.claim_id <> p_claim_id or
     authorization_row.token_hash <> encode(digest(p_authorization_token, 'sha256'), 'hex') then
    return query select 'identity_mismatch'::text, null::text, null::text, null::text;
    return;
  end if;

  if authorization_row.status = 'consumed' then
    select * into claim_row
    from public.continuous_intelligence_shadow_canary_daily_claims
    where continuous_intelligence_shadow_canary_daily_claims.claim_id = p_claim_id
    for update;
    if found and claim_row.execution_id = p_execution_id and claim_row.request_fingerprint = p_request_fingerprint then
      return query select 'already_admitted'::text, authorization_row.authorization_id, claim_row.claim_id, claim_row.status;
    end if;
    return query select 'daily_usage_unavailable'::text, null::text, null::text, null::text;
    return;
  end if;

  if authorization_row.status <> 'issued' then
    return query select 'authorization_replayed'::text, authorization_row.authorization_id, null::text, null::text;
    return;
  end if;
  if authorization_row.expires_at <= now() then
    update public.continuous_intelligence_shadow_canary_manual_authorizations
    set status = 'expired'
    where authorization_id = authorization_row.authorization_id;
    return query select 'authorization_expired'::text, authorization_row.authorization_id, null::text, null::text;
    return;
  end if;

  select count(*), coalesce(sum(estimated_credits), 0)
  into run_count, credit_count
  from public.continuous_intelligence_shadow_canary_daily_claims
  where utc_day = p_utc_day;
  if run_count >= 2 or credit_count + 1 > 2 then
    return query select 'daily_limit_reached'::text, authorization_row.authorization_id, null::text, null::text;
    return;
  end if;

  insert into public.continuous_intelligence_shadow_canary_daily_claims (
    claim_id, execution_id, request_fingerprint, utc_day, estimated_credits, status, provider_attempted
  ) values (
    p_claim_id, p_execution_id, p_request_fingerprint, p_utc_day, 1, 'attempted', false
  );

  update public.continuous_intelligence_shadow_canary_manual_authorizations
  set status = 'consumed', consumed_at = now()
  where authorization_id = authorization_row.authorization_id and status = 'issued';

  if not found then
    raise exception 'manual authorization admission lost atomic state';
  end if;

  return query select 'attempt_started'::text, authorization_row.authorization_id, p_claim_id, 'attempted'::text;
exception when unique_violation then
  return query select 'daily_usage_unavailable'::text, null::text, null::text, null::text;
end;
$$;

revoke all on function public.admit_continuous_intelligence_shadow_canary_manual_execution(text, text, text, text, text, date) from public, anon, authenticated;
grant execute on function public.admit_continuous_intelligence_shadow_canary_manual_execution(text, text, text, text, text, date) to service_role;

comment on function public.admit_continuous_intelligence_shadow_canary_manual_execution(text, text, text, text, text, date) is
  'Action 583 atomic manual-canary admission: consume the immutable short-lived authorization and durably admit exactly one attempted claim in the same transaction.';
