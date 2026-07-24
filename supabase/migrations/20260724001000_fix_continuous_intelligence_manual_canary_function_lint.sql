-- Action 644: fix production database function lint without changing RPC contracts.

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
set search_path = public, extensions
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
    where continuous_intelligence_shadow_canary_manual_authorizations.authorization_id = authorization_row.authorization_id;
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
  where continuous_intelligence_shadow_canary_manual_authorizations.authorization_id = authorization_row.authorization_id
    and continuous_intelligence_shadow_canary_manual_authorizations.status = 'issued';

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


create or replace function public.ci_mca_issue(
  p_authorization_id text,
  p_token_hash text,
  p_issued_at timestamptz,
  p_expires_at timestamptz,
  p_request_fingerprint text,
  p_execution_id text,
  p_claim_id text,
  p_ticker text,
  p_interval text,
  p_requested_start timestamptz,
  p_requested_end timestamptz,
  p_calendar_contract_version text,
  p_calendar_fingerprint text,
  p_budget_policy_version text,
  p_policy_total_credits smallint,
  p_policy_hard_reserve_credits smallint,
  p_policy_normal_planned_max_credits smallint,
  p_estimated_credits smallint,
  p_canary_contract_version text,
  p_claim_contract_version text,
  p_deployment_commit text,
  p_deployment_build_marker text,
  p_purpose text
)
returns table (
  outcome text,
  authorization_id text,
  contract_version text,
  purpose text,
  issued_at timestamptz,
  expires_at timestamptz,
  consumed_at timestamptz,
  authorization_status text,
  request_fingerprint text,
  execution_id text,
  claim_id text,
  ticker text,
  market_interval text,
  requested_start timestamptz,
  requested_end timestamptz,
  calendar_contract_version text,
  calendar_fingerprint text,
  budget_policy_version text,
  policy_total_credits smallint,
  policy_hard_reserve_credits smallint,
  policy_normal_planned_max_credits smallint,
  estimated_credits smallint,
  canary_contract_version text,
  claim_contract_version text,
  deployment_commit text,
  deployment_build_marker text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  existing public.continuous_intelligence_shadow_canary_manual_authorizations%rowtype;
begin
  if p_expires_at is null or p_issued_at is null or p_requested_start is null or p_requested_end is null or
     p_expires_at <= p_issued_at or p_expires_at > p_issued_at + interval '60 seconds' or
     p_ticker is distinct from 'AAPL' or p_interval is distinct from '5min' or p_requested_end - p_requested_start is distinct from interval '30 minutes' or
     p_policy_total_credits is distinct from 377 or p_policy_hard_reserve_credits is distinct from 57 or p_policy_normal_planned_max_credits is distinct from 320 or p_estimated_credits is distinct from 1 or
     p_calendar_contract_version is distinct from 'us_equity_market_calendar_v1' or p_budget_policy_version is distinct from 'continuous_intelligence_credit_ledger_v1' or
     p_canary_contract_version is distinct from 'continuous_intelligence_shadow_collector_canary_v1' or p_claim_contract_version is distinct from 'continuous_intelligence_shadow_canary_daily_claim_v1' or
     p_purpose is distinct from 'one_manual_shadow_canary_attempt' or coalesce(p_token_hash !~ '^[0-9a-f]{64}$', true) then
    return query select 'unavailable'::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::timestamptz, null::text, null::text, null::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint, null::smallint, null::text, null::text, null::text, null::text;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext('continuous_intelligence_shadow_canary_manual_authorization'));
  update public.continuous_intelligence_shadow_canary_manual_authorizations
  set status = 'expired'
  where continuous_intelligence_shadow_canary_manual_authorizations.status = 'issued'
    and continuous_intelligence_shadow_canary_manual_authorizations.expires_at <= now();

  select * into existing
  from public.continuous_intelligence_shadow_canary_manual_authorizations
  where continuous_intelligence_shadow_canary_manual_authorizations.status = 'issued'
    and continuous_intelligence_shadow_canary_manual_authorizations.expires_at > now()
  order by continuous_intelligence_shadow_canary_manual_authorizations.issued_at asc
  limit 1
  for update;

  if found then
    if existing.request_fingerprint = p_request_fingerprint and existing.execution_id = p_execution_id and existing.claim_id = p_claim_id and
       existing.ticker = p_ticker and existing.interval = p_interval and existing.requested_start = p_requested_start and existing.requested_end = p_requested_end and
       existing.calendar_contract_version = p_calendar_contract_version and existing.calendar_fingerprint = p_calendar_fingerprint and
       existing.deployment_commit = p_deployment_commit and existing.deployment_build_marker = p_deployment_build_marker then
      return query select 'already_issued'::text, existing.authorization_id, existing.contract_version, existing.purpose, existing.issued_at, existing.expires_at, existing.consumed_at, existing.status, existing.request_fingerprint, existing.execution_id, existing.claim_id, existing.ticker, existing.interval, existing.requested_start, existing.requested_end, existing.calendar_contract_version, existing.calendar_fingerprint, existing.budget_policy_version, existing.policy_total_credits, existing.policy_hard_reserve_credits, existing.policy_normal_planned_max_credits, existing.estimated_credits, existing.canary_contract_version, existing.claim_contract_version, existing.deployment_commit, existing.deployment_build_marker;
    else
      return query select 'conflicting_active_authorization'::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::timestamptz, null::text, null::text, null::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint, null::smallint, null::text, null::text, null::text, null::text;
    end if;
    return;
  end if;

  insert into public.continuous_intelligence_shadow_canary_manual_authorizations (
    authorization_id, token_hash, issued_at, expires_at, request_fingerprint, execution_id, claim_id,
    ticker, interval, requested_start, requested_end, calendar_contract_version, calendar_fingerprint,
    budget_policy_version, policy_total_credits, policy_hard_reserve_credits, policy_normal_planned_max_credits,
    estimated_credits, canary_contract_version, claim_contract_version, deployment_commit, deployment_build_marker, purpose
  ) values (
    p_authorization_id, p_token_hash, p_issued_at, p_expires_at, p_request_fingerprint, p_execution_id, p_claim_id,
    p_ticker, p_interval, p_requested_start, p_requested_end, p_calendar_contract_version, p_calendar_fingerprint,
    p_budget_policy_version, p_policy_total_credits, p_policy_hard_reserve_credits, p_policy_normal_planned_max_credits,
    p_estimated_credits, p_canary_contract_version, p_claim_contract_version, p_deployment_commit, p_deployment_build_marker, p_purpose
  ) returning * into existing;

  return query select 'issued'::text, existing.authorization_id, existing.contract_version, existing.purpose, existing.issued_at, existing.expires_at, existing.consumed_at, existing.status, existing.request_fingerprint, existing.execution_id, existing.claim_id, existing.ticker, existing.interval, existing.requested_start, existing.requested_end, existing.calendar_contract_version, existing.calendar_fingerprint, existing.budget_policy_version, existing.policy_total_credits, existing.policy_hard_reserve_credits, existing.policy_normal_planned_max_credits, existing.estimated_credits, existing.canary_contract_version, existing.claim_contract_version, existing.deployment_commit, existing.deployment_build_marker;
exception when others then
  return query select 'unavailable'::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::timestamptz, null::text, null::text, null::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint, null::smallint, null::text, null::text, null::text, null::text;
end;
$$;

revoke all on function public.ci_mca_issue(text, text, timestamptz, timestamptz, text, text, text, text, text, timestamptz, timestamptz, text, text, text, smallint, smallint, smallint, smallint, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.ci_mca_issue(text, text, timestamptz, timestamptz, text, text, text, text, text, timestamptz, timestamptz, text, text, text, smallint, smallint, smallint, smallint, text, text, text, text, text) to service_role;


create or replace function public.ci_mca_consume(
  p_authorization_id text,
  p_authorization_token text,
  p_request_fingerprint text,
  p_execution_id text,
  p_claim_id text
)
returns table (
  outcome text,
  authorization_id text,
  contract_version text,
  purpose text,
  issued_at timestamptz,
  expires_at timestamptz,
  consumed_at timestamptz,
  authorization_status text,
  request_fingerprint text,
  execution_id text,
  claim_id text,
  ticker text,
  market_interval text,
  requested_start timestamptz,
  requested_end timestamptz,
  calendar_contract_version text,
  calendar_fingerprint text,
  budget_policy_version text,
  policy_total_credits smallint,
  policy_hard_reserve_credits smallint,
  policy_normal_planned_max_credits smallint,
  estimated_credits smallint,
  canary_contract_version text,
  claim_contract_version text,
  deployment_commit text,
  deployment_build_marker text
)
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  existing public.continuous_intelligence_shadow_canary_manual_authorizations%rowtype;
begin
  select * into existing
  from public.continuous_intelligence_shadow_canary_manual_authorizations
  where continuous_intelligence_shadow_canary_manual_authorizations.authorization_id = p_authorization_id
  for update;

  if not found then
    return query select 'invalid_token'::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::timestamptz, null::text, null::text, null::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint, null::smallint, null::text, null::text, null::text, null::text;
    return;
  end if;
  if existing.request_fingerprint <> p_request_fingerprint or existing.execution_id <> p_execution_id or existing.claim_id <> p_claim_id then
    return query select 'identity_mismatch'::text, existing.authorization_id, existing.contract_version, existing.purpose, existing.issued_at, existing.expires_at, existing.consumed_at, existing.status, existing.request_fingerprint, existing.execution_id, existing.claim_id, existing.ticker, existing.interval, existing.requested_start, existing.requested_end, existing.calendar_contract_version, existing.calendar_fingerprint, existing.budget_policy_version, existing.policy_total_credits, existing.policy_hard_reserve_credits, existing.policy_normal_planned_max_credits, existing.estimated_credits, existing.canary_contract_version, existing.claim_contract_version, existing.deployment_commit, existing.deployment_build_marker;
    return;
  end if;
  if existing.status = 'consumed' then
    return query select 'already_consumed'::text, existing.authorization_id, existing.contract_version, existing.purpose, existing.issued_at, existing.expires_at, existing.consumed_at, existing.status, existing.request_fingerprint, existing.execution_id, existing.claim_id, existing.ticker, existing.interval, existing.requested_start, existing.requested_end, existing.calendar_contract_version, existing.calendar_fingerprint, existing.budget_policy_version, existing.policy_total_credits, existing.policy_hard_reserve_credits, existing.policy_normal_planned_max_credits, existing.estimated_credits, existing.canary_contract_version, existing.claim_contract_version, existing.deployment_commit, existing.deployment_build_marker;
    return;
  end if;
  if existing.status = 'revoked' then
    return query select 'revoked'::text, existing.authorization_id, existing.contract_version, existing.purpose, existing.issued_at, existing.expires_at, existing.consumed_at, existing.status, existing.request_fingerprint, existing.execution_id, existing.claim_id, existing.ticker, existing.interval, existing.requested_start, existing.requested_end, existing.calendar_contract_version, existing.calendar_fingerprint, existing.budget_policy_version, existing.policy_total_credits, existing.policy_hard_reserve_credits, existing.policy_normal_planned_max_credits, existing.estimated_credits, existing.canary_contract_version, existing.claim_contract_version, existing.deployment_commit, existing.deployment_build_marker;
    return;
  end if;
  if existing.status = 'expired' or existing.expires_at <= now() then
    update public.continuous_intelligence_shadow_canary_manual_authorizations
    set status = 'expired'
    where continuous_intelligence_shadow_canary_manual_authorizations.authorization_id = existing.authorization_id;
    existing.status := 'expired';
    return query select 'expired'::text, existing.authorization_id, existing.contract_version, existing.purpose, existing.issued_at, existing.expires_at, existing.consumed_at, existing.status, existing.request_fingerprint, existing.execution_id, existing.claim_id, existing.ticker, existing.interval, existing.requested_start, existing.requested_end, existing.calendar_contract_version, existing.calendar_fingerprint, existing.budget_policy_version, existing.policy_total_credits, existing.policy_hard_reserve_credits, existing.policy_normal_planned_max_credits, existing.estimated_credits, existing.canary_contract_version, existing.claim_contract_version, existing.deployment_commit, existing.deployment_build_marker;
    return;
  end if;
  if existing.token_hash <> encode(digest(p_authorization_token, 'sha256'), 'hex') then
    return query select 'invalid_token'::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::timestamptz, null::text, null::text, null::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint, null::smallint, null::text, null::text, null::text, null::text;
    return;
  end if;

  update public.continuous_intelligence_shadow_canary_manual_authorizations
  set status = 'consumed', consumed_at = now()
  where continuous_intelligence_shadow_canary_manual_authorizations.authorization_id = existing.authorization_id
    and continuous_intelligence_shadow_canary_manual_authorizations.status = 'issued'
  returning * into existing;
  if found then
    return query select 'consumed'::text, existing.authorization_id, existing.contract_version, existing.purpose, existing.issued_at, existing.expires_at, existing.consumed_at, existing.status, existing.request_fingerprint, existing.execution_id, existing.claim_id, existing.ticker, existing.interval, existing.requested_start, existing.requested_end, existing.calendar_contract_version, existing.calendar_fingerprint, existing.budget_policy_version, existing.policy_total_credits, existing.policy_hard_reserve_credits, existing.policy_normal_planned_max_credits, existing.estimated_credits, existing.canary_contract_version, existing.claim_contract_version, existing.deployment_commit, existing.deployment_build_marker;
    return;
  end if;
  return query select 'unavailable'::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::timestamptz, null::text, null::text, null::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint, null::smallint, null::text, null::text, null::text, null::text;
exception when others then
  return query select 'unavailable'::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::timestamptz, null::text, null::text, null::text, null::text, null::text, null::text, null::timestamptz, null::timestamptz, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint, null::smallint, null::text, null::text, null::text, null::text;
end;
$$;

revoke all on function public.ci_mca_consume(text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.ci_mca_consume(text, text, text, text, text) to service_role;


comment on function public.admit_continuous_intelligence_shadow_canary_manual_execution(text, text, text, text, text, date) is
  'Action 644 lint-safe atomic manual-canary admission. Preserves the Action 583 contract and resolves pgcrypto digest through the extensions search path.';

comment on function public.ci_mca_issue(text, text, timestamptz, timestamptz, text, text, text, text, text, timestamptz, timestamptz, text, text, text, smallint, smallint, smallint, smallint, text, text, text, text, text) is
  'Action 644 lint-safe manual canary authorization issuance RPC. Preserves the existing contract and qualifies table-column references that overlap output names.';

comment on function public.ci_mca_consume(text, text, text, text, text) is
  'Action 644 lint-safe manual canary authorization consumption RPC. Preserves the existing contract and qualifies table-column references that overlap output names.';
