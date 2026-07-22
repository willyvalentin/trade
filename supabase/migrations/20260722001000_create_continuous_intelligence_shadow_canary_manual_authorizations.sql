create table if not exists public.continuous_intelligence_shadow_canary_manual_authorizations (
  authorization_id text primary key,
  contract_version text not null default 'continuous_intelligence_shadow_canary_manual_authorization_v1',
  purpose text not null default 'one_manual_shadow_canary_attempt',
  token_hash text not null unique,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  consumed_at timestamptz null,
  status text not null default 'issued',
  request_fingerprint text not null,
  execution_id text not null,
  claim_id text not null,
  ticker text not null,
  interval text not null,
  requested_start timestamptz not null,
  requested_end timestamptz not null,
  calendar_contract_version text not null,
  calendar_fingerprint text not null,
  budget_policy_version text not null,
  policy_total_credits smallint not null,
  policy_hard_reserve_credits smallint not null,
  policy_normal_planned_max_credits smallint not null,
  estimated_credits smallint not null,
  canary_contract_version text not null,
  claim_contract_version text not null,
  deployment_commit text not null,
  deployment_build_marker text not null,
  constraint continuous_intelligence_shadow_canary_manual_authorization_status_check
    check (status in ('issued', 'consumed', 'expired', 'revoked')),
  constraint continuous_intelligence_shadow_canary_manual_authorization_ttl_check
    check (expires_at > issued_at and expires_at <= issued_at + interval '60 seconds'),
  constraint continuous_intelligence_shadow_canary_manual_authorization_consumption_check
    check ((status = 'consumed' and consumed_at is not null) or (status <> 'consumed' and consumed_at is null)),
  constraint continuous_intelligence_shadow_canary_manual_authorization_request_check
    check (ticker = 'AAPL' and interval = '5min' and requested_end > requested_start and requested_end - requested_start = interval '30 minutes'),
  constraint continuous_intelligence_shadow_canary_manual_authorization_policy_check
    check (policy_total_credits = 377 and policy_hard_reserve_credits = 57 and policy_normal_planned_max_credits = 320 and estimated_credits = 1),
  constraint continuous_intelligence_shadow_canary_manual_authorization_contract_check
    check (contract_version = 'continuous_intelligence_shadow_canary_manual_authorization_v1' and purpose = 'one_manual_shadow_canary_attempt' and calendar_contract_version = 'us_equity_market_calendar_v1' and budget_policy_version = 'continuous_intelligence_credit_ledger_v1' and canary_contract_version = 'continuous_intelligence_shadow_collector_canary_v1' and claim_contract_version = 'continuous_intelligence_shadow_canary_daily_claim_v1'),
  constraint continuous_intelligence_shadow_canary_manual_authorization_text_check
    check (token_hash ~ '^[0-9a-f]{64}$' and length(authorization_id) between 1 and 128 and length(request_fingerprint) between 1 and 240 and length(execution_id) between 1 and 128 and length(claim_id) between 1 and 128 and length(calendar_fingerprint) between 1 and 128 and length(deployment_commit) between 1 and 128 and length(deployment_build_marker) between 1 and 128)
);

create index if not exists continuous_intelligence_shadow_canary_manual_authorization_active_idx
  on public.continuous_intelligence_shadow_canary_manual_authorizations (status, expires_at);

alter table public.continuous_intelligence_shadow_canary_manual_authorizations enable row level security;

create or replace function public.issue_continuous_intelligence_shadow_canary_manual_authorization(
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
  where status = 'issued' and expires_at <= now();

  select * into existing
  from public.continuous_intelligence_shadow_canary_manual_authorizations
  where status = 'issued' and expires_at > now()
  order by issued_at asc
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

revoke all on function public.issue_continuous_intelligence_shadow_canary_manual_authorization(text, text, timestamptz, timestamptz, text, text, text, text, text, timestamptz, timestamptz, text, text, text, smallint, smallint, smallint, smallint, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.issue_continuous_intelligence_shadow_canary_manual_authorization(text, text, timestamptz, timestamptz, text, text, text, text, text, timestamptz, timestamptz, text, text, text, smallint, smallint, smallint, smallint, text, text, text, text, text) to service_role;

create or replace function public.consume_continuous_intelligence_shadow_canary_manual_authorization(
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
  where authorization_id = p_authorization_id
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
    update public.continuous_intelligence_shadow_canary_manual_authorizations set status = 'expired' where authorization_id = existing.authorization_id;
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
  where authorization_id = existing.authorization_id and status = 'issued'
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

revoke all on function public.consume_continuous_intelligence_shadow_canary_manual_authorization(text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.consume_continuous_intelligence_shadow_canary_manual_authorization(text, text, text, text, text) to service_role;

comment on table public.continuous_intelligence_shadow_canary_manual_authorizations is
  'Action 580 durable, single-use manual canary authorizations. Only SHA-256 token hashes and sanitized immutable request facts are retained.';
