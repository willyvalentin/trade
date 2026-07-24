create table if not exists public.continuous_intelligence_shadow_canary_manual_execution_leases (
  execution_lease_id text primary key,
  authorization_id text not null unique references public.continuous_intelligence_shadow_canary_manual_authorizations(authorization_id),
  contract_version text not null default 'continuous_intelligence_shadow_canary_manual_execution_lease_v1',
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
  policy_total_credits smallint not null,
  policy_hard_reserve_credits smallint not null,
  policy_normal_planned_max_credits smallint not null,
  estimated_credits smallint not null,
  constraint canary_manual_lease_status_check
    check (status in ('issued', 'consumed', 'expired', 'revoked')),
  constraint canary_manual_lease_ttl_check
    check (expires_at > issued_at and expires_at <= issued_at + interval '60 seconds'),
  constraint canary_manual_lease_consumption_check
    check ((status = 'consumed' and consumed_at is not null) or (status <> 'consumed' and consumed_at is null)),
  constraint canary_manual_lease_request_check
    check (ticker = 'AAPL' and interval = '5min' and requested_end > requested_start and requested_end - requested_start = interval '30 minutes'),
  constraint canary_manual_lease_policy_check
    check (policy_total_credits = 377 and policy_hard_reserve_credits = 57 and policy_normal_planned_max_credits = 320 and estimated_credits = 1),
  constraint canary_manual_lease_contract_check
    check (contract_version = 'continuous_intelligence_shadow_canary_manual_execution_lease_v1'),
  constraint canary_manual_lease_text_check
    check (length(execution_lease_id) between 1 and 128 and length(authorization_id) between 1 and 128 and length(request_fingerprint) between 1 and 240 and length(execution_id) between 1 and 128 and length(claim_id) between 1 and 128)
);

create index if not exists continuous_intelligence_shadow_canary_manual_execution_lease_active_idx
  on public.continuous_intelligence_shadow_canary_manual_execution_leases (status, expires_at);

alter table public.continuous_intelligence_shadow_canary_manual_execution_leases enable row level security;

create or replace function public.issue_ci_shadow_canary_manual_lease(
  p_authorization_id text,
  p_execution_lease_id text,
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
  execution_lease_id text,
  issued_at timestamptz,
  expires_at timestamptz,
  authorization_status text,
  lease_status text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  authorization_row public.continuous_intelligence_shadow_canary_manual_authorizations%rowtype;
  lease_row public.continuous_intelligence_shadow_canary_manual_execution_leases%rowtype;
begin
  if p_execution_lease_id is null or length(p_execution_lease_id) < 1 or length(p_execution_lease_id) > 128 or
     p_expires_at is null or p_issued_at is null or p_requested_start is null or p_requested_end is null or
     p_expires_at <= p_issued_at or p_expires_at > p_issued_at + interval '60 seconds' or
     p_ticker is distinct from 'AAPL' or p_interval is distinct from '5min' or p_requested_end - p_requested_start is distinct from interval '30 minutes' or
     p_policy_total_credits is distinct from 377 or p_policy_hard_reserve_credits is distinct from 57 or p_policy_normal_planned_max_credits is distinct from 320 or p_estimated_credits is distinct from 1 or
     p_calendar_contract_version is distinct from 'us_equity_market_calendar_v1' or p_budget_policy_version is distinct from 'continuous_intelligence_credit_ledger_v1' or
     p_canary_contract_version is distinct from 'continuous_intelligence_shadow_collector_canary_v1' or p_claim_contract_version is distinct from 'continuous_intelligence_shadow_canary_daily_claim_v1' or
     p_purpose is distinct from 'one_manual_shadow_canary_attempt' or coalesce(p_token_hash !~ '^[0-9a-f]{64}$', true) then
    return query select 'unavailable'::text, null::text, null::text, null::timestamptz, null::timestamptz, null::text, null::text;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext('continuous_intelligence_shadow_canary_manual_authorization'));
  update public.continuous_intelligence_shadow_canary_manual_authorizations as authorization_table
    set status = 'expired'
    where authorization_table.status = 'issued' and authorization_table.expires_at <= now();
  update public.continuous_intelligence_shadow_canary_manual_execution_leases as lease_table
    set status = 'expired'
    where lease_table.status = 'issued' and lease_table.expires_at <= now();

  select * into authorization_row
  from public.continuous_intelligence_shadow_canary_manual_authorizations as authorization_table
  where authorization_table.status = 'issued' and authorization_table.expires_at > now()
  order by authorization_table.issued_at asc limit 1 for update;
  if found then
    select * into lease_row
    from public.continuous_intelligence_shadow_canary_manual_execution_leases as lease_table
    where lease_table.authorization_id = authorization_row.authorization_id
    for update;
    if lease_row.execution_lease_id is not null and authorization_row.request_fingerprint = p_request_fingerprint and
       authorization_row.execution_id = p_execution_id and authorization_row.claim_id = p_claim_id and
       authorization_row.ticker = p_ticker and authorization_row.interval = p_interval and
       authorization_row.requested_start = p_requested_start and authorization_row.requested_end = p_requested_end and
       authorization_row.calendar_contract_version = p_calendar_contract_version and authorization_row.calendar_fingerprint = p_calendar_fingerprint and
       authorization_row.deployment_commit = p_deployment_commit and authorization_row.deployment_build_marker = p_deployment_build_marker and
       lease_row.status = 'issued' and lease_row.request_fingerprint = p_request_fingerprint and
       lease_row.execution_id = p_execution_id and lease_row.claim_id = p_claim_id then
      return query select 'already_issued'::text, authorization_row.authorization_id, lease_row.execution_lease_id,
        authorization_row.issued_at, authorization_row.expires_at, authorization_row.status, lease_row.status;
      return;
    end if;
    return query select 'conflicting_active_authorization'::text, null::text, null::text, null::timestamptz, null::timestamptz, null::text, null::text;
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
  ) returning * into authorization_row;
  insert into public.continuous_intelligence_shadow_canary_manual_execution_leases (
    execution_lease_id, authorization_id, issued_at, expires_at, request_fingerprint, execution_id, claim_id,
    ticker, interval, requested_start, requested_end, policy_total_credits, policy_hard_reserve_credits,
    policy_normal_planned_max_credits, estimated_credits
  ) values (
    p_execution_lease_id, authorization_row.authorization_id, authorization_row.issued_at, authorization_row.expires_at,
    p_request_fingerprint, p_execution_id, p_claim_id, p_ticker, p_interval, p_requested_start, p_requested_end,
    p_policy_total_credits, p_policy_hard_reserve_credits, p_policy_normal_planned_max_credits, p_estimated_credits
  ) returning * into lease_row;
  return query select 'issued'::text, authorization_row.authorization_id, lease_row.execution_lease_id,
    authorization_row.issued_at, authorization_row.expires_at, authorization_row.status, lease_row.status;
exception when others then
  return query select 'unavailable'::text, null::text, null::text, null::timestamptz, null::timestamptz, null::text, null::text;
end;
$$;

create or replace function public.admit_ci_shadow_canary_manual_lease(
  p_authorization_id text,
  p_authorization_token text,
  p_execution_lease_id text,
  p_request_fingerprint text,
  p_execution_id text,
  p_claim_id text,
  p_utc_day date
)
returns table (
  admission_status text,
  authorization_id text,
  execution_lease_id text,
  claim_id text,
  claim_status text
)
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  authorization_row public.continuous_intelligence_shadow_canary_manual_authorizations%rowtype;
  lease_row public.continuous_intelligence_shadow_canary_manual_execution_leases%rowtype;
  claim_row public.continuous_intelligence_shadow_canary_daily_claims%rowtype;
  authorization_found boolean := false;
  lease_found boolean := false;
  run_count integer;
  credit_count integer;
begin
  if p_utc_day is null or p_authorization_token is null or length(p_authorization_token) < 32 or p_execution_lease_id is null then
    return query select 'daily_usage_unavailable'::text, null::text, null::text, null::text, null::text;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext('continuous_intelligence_shadow_canary_manual_execution:' || p_utc_day::text));

  select * into authorization_row
  from public.continuous_intelligence_shadow_canary_manual_authorizations as authorization_table
  where authorization_table.authorization_id = p_authorization_id
  for update;
  authorization_found := found;
  select * into lease_row
  from public.continuous_intelligence_shadow_canary_manual_execution_leases as lease_table
  where lease_table.execution_lease_id = p_execution_lease_id
  for update;
  lease_found := found;

  if not authorization_found or not lease_found or authorization_row.authorization_id <> lease_row.authorization_id or
     authorization_row.request_fingerprint <> p_request_fingerprint or authorization_row.execution_id <> p_execution_id or
     authorization_row.claim_id <> p_claim_id or lease_row.request_fingerprint <> p_request_fingerprint or
     lease_row.execution_id <> p_execution_id or lease_row.claim_id <> p_claim_id or
     authorization_row.token_hash <> encode(digest(p_authorization_token, 'sha256'), 'hex') or
     authorization_row.ticker <> 'AAPL' or authorization_row.interval <> '5min' or
     authorization_row.requested_end - authorization_row.requested_start <> interval '30 minutes' or
     authorization_row.policy_total_credits <> 377 or authorization_row.policy_hard_reserve_credits <> 57 or
     authorization_row.policy_normal_planned_max_credits <> 320 or authorization_row.estimated_credits <> 1 or
     lease_row.ticker <> authorization_row.ticker or lease_row.interval <> authorization_row.interval or
     lease_row.requested_start <> authorization_row.requested_start or lease_row.requested_end <> authorization_row.requested_end or
     lease_row.policy_total_credits <> authorization_row.policy_total_credits or
     lease_row.policy_hard_reserve_credits <> authorization_row.policy_hard_reserve_credits or
     lease_row.policy_normal_planned_max_credits <> authorization_row.policy_normal_planned_max_credits or
     lease_row.estimated_credits <> authorization_row.estimated_credits then
    return query select 'identity_mismatch'::text, null::text, null::text, null::text, null::text;
    return;
  end if;

  if authorization_row.status = 'consumed' and lease_row.status = 'consumed' then
    select * into claim_row from public.continuous_intelligence_shadow_canary_daily_claims as claim_table
    where claim_table.claim_id = p_claim_id for update;
    if found and claim_row.execution_id = p_execution_id and claim_row.request_fingerprint = p_request_fingerprint then
      return query select 'already_admitted'::text, authorization_row.authorization_id, lease_row.execution_lease_id, claim_row.claim_id, claim_row.status;
    end if;
    return query select 'daily_usage_unavailable'::text, null::text, null::text, null::text, null::text;
    return;
  end if;
  if authorization_row.status <> 'issued' or lease_row.status <> 'issued' then
    return query select 'authorization_replayed'::text, null::text, null::text, null::text, null::text;
    return;
  end if;
  if authorization_row.expires_at <= now() or lease_row.expires_at <= now() then
    update public.continuous_intelligence_shadow_canary_manual_authorizations as authorization_table
      set status = 'expired' where authorization_table.authorization_id = authorization_row.authorization_id and authorization_table.status = 'issued';
    update public.continuous_intelligence_shadow_canary_manual_execution_leases as lease_table
      set status = 'expired' where lease_table.execution_lease_id = lease_row.execution_lease_id and lease_table.status = 'issued';
    return query select 'authorization_expired'::text, authorization_row.authorization_id, lease_row.execution_lease_id, null::text, null::text;
    return;
  end if;

  select count(*), coalesce(sum(estimated_credits), 0) into run_count, credit_count
  from public.continuous_intelligence_shadow_canary_daily_claims where utc_day = p_utc_day;
  if run_count >= 2 or credit_count + 1 > 2 then
    return query select 'daily_limit_reached'::text, authorization_row.authorization_id, lease_row.execution_lease_id, null::text, null::text;
    return;
  end if;

  insert into public.continuous_intelligence_shadow_canary_daily_claims (
    claim_id, execution_id, request_fingerprint, utc_day, estimated_credits, status, provider_attempted
  ) values (p_claim_id, p_execution_id, p_request_fingerprint, p_utc_day, 1, 'attempted', false);
  update public.continuous_intelligence_shadow_canary_manual_execution_leases as lease_table
    set status = 'consumed', consumed_at = now()
    where lease_table.execution_lease_id = lease_row.execution_lease_id and lease_table.status = 'issued';
  if not found then raise exception 'manual execution lease admission lost atomic state'; end if;
  update public.continuous_intelligence_shadow_canary_manual_authorizations as authorization_table
    set status = 'consumed', consumed_at = now()
    where authorization_table.authorization_id = authorization_row.authorization_id and authorization_table.status = 'issued';
  if not found then raise exception 'manual authorization admission lost atomic state'; end if;
  return query select 'attempt_started'::text, authorization_row.authorization_id, lease_row.execution_lease_id, p_claim_id, 'attempted'::text;
exception when unique_violation then
  return query select 'daily_usage_unavailable'::text, null::text, null::text, null::text, null::text;
end;
$$;

revoke all on table public.continuous_intelligence_shadow_canary_manual_execution_leases from public, anon, authenticated;
revoke all on function public.issue_ci_shadow_canary_manual_lease(text, text, text, timestamptz, timestamptz, text, text, text, text, text, timestamptz, timestamptz, text, text, text, smallint, smallint, smallint, smallint, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.admit_continuous_intelligence_shadow_canary_manual_execution(text, text, text, text, text, date) from service_role;
revoke all on function public.admit_ci_shadow_canary_manual_lease(text, text, text, text, text, text, date) from public, anon, authenticated;
grant execute on function public.issue_ci_shadow_canary_manual_lease(text, text, text, timestamptz, timestamptz, text, text, text, text, text, timestamptz, timestamptz, text, text, text, smallint, smallint, smallint, smallint, text, text, text, text, text) to service_role;
grant execute on function public.admit_ci_shadow_canary_manual_lease(text, text, text, text, text, text, date) to service_role;

comment on table public.continuous_intelligence_shadow_canary_manual_execution_leases is
  'Action 585 opaque one-time manual execution leases. Lease IDs are non-secret binding references; no raw lease credential is persisted.';
comment on function public.admit_ci_shadow_canary_manual_lease(text, text, text, text, text, text, date) is
  'Action 585 atomic manual admission: consume matching authorization and opaque lease while admitting exactly one attempted claim. The lease only replaces disabled default canary controls for this exact request.';
