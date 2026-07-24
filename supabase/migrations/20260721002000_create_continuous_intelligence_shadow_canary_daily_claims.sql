create table if not exists public.continuous_intelligence_shadow_canary_daily_claims (
  id uuid primary key default gen_random_uuid(),
  contract_version text not null default 'continuous_intelligence_shadow_canary_daily_claim_v1',
  claim_id text not null unique,
  execution_id text not null unique,
  request_fingerprint text not null,
  utc_day date not null,
  estimated_credits smallint not null,
  status text not null default 'claimed',
  provider_attempted boolean not null default false,
  source_receipt_id text null,
  created_at timestamptz not null default now(),
  finalized_at timestamptz null,
  constraint continuous_intelligence_shadow_canary_claim_credit_check
    check (estimated_credits = 1),
  constraint continuous_intelligence_shadow_canary_claim_status_check
    check (status in ('claimed', 'attempted', 'completed', 'failed')),
  constraint continuous_intelligence_shadow_canary_claim_lengths_check
    check (length(claim_id) between 1 and 128 and length(execution_id) between 1 and 128 and length(request_fingerprint) between 1 and 240)
);

create index if not exists continuous_intelligence_shadow_canary_claim_day_idx
  on public.continuous_intelligence_shadow_canary_daily_claims (utc_day, created_at);

alter table public.continuous_intelligence_shadow_canary_daily_claims enable row level security;

create or replace function public.claim_continuous_intelligence_shadow_canary(
  p_claim_id text,
  p_execution_id text,
  p_request_fingerprint text,
  p_utc_day date,
  p_estimated_credits smallint
)
returns table (
  claimed boolean,
  idempotent boolean,
  claim_id text,
  claim_status text,
  blocker text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  existing public.continuous_intelligence_shadow_canary_daily_claims%rowtype;
  run_count integer;
  credit_count integer;
begin
  if p_estimated_credits <> 1 then
    return query select false, false, null::text, null::text, 'daily_credit_limit_reached'::text;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext('continuous_intelligence_shadow_canary:' || p_utc_day::text));

  select * into existing
  from public.continuous_intelligence_shadow_canary_daily_claims
  where execution_id = p_execution_id;

  if found then
    if existing.utc_day = p_utc_day and existing.request_fingerprint = p_request_fingerprint then
      return query select true, true, existing.claim_id, existing.status, null::text;
    else
      return query select false, false, null::text, null::text, 'daily_usage_unavailable'::text;
    end if;
    return;
  end if;

  select count(*), coalesce(sum(estimated_credits), 0)
  into run_count, credit_count
  from public.continuous_intelligence_shadow_canary_daily_claims
  where utc_day = p_utc_day;

  if run_count >= 2 then
    return query select false, false, null::text, null::text, 'daily_run_limit_reached'::text;
    return;
  end if;
  if credit_count + p_estimated_credits > 2 then
    return query select false, false, null::text, null::text, 'daily_credit_limit_reached'::text;
    return;
  end if;

  insert into public.continuous_intelligence_shadow_canary_daily_claims (
    claim_id, execution_id, request_fingerprint, utc_day, estimated_credits
  ) values (
    p_claim_id, p_execution_id, p_request_fingerprint, p_utc_day, p_estimated_credits
  );

  return query select true, false, p_claim_id, 'claimed'::text, null::text;
exception when unique_violation then
  select * into existing
  from public.continuous_intelligence_shadow_canary_daily_claims
  where execution_id = p_execution_id;
  if found and existing.utc_day = p_utc_day and existing.request_fingerprint = p_request_fingerprint then
    return query select true, true, existing.claim_id, existing.status, null::text;
  else
    return query select false, false, null::text, null::text, 'daily_usage_unavailable'::text;
  end if;
end;
$$;

revoke all on function public.claim_continuous_intelligence_shadow_canary(text, text, text, date, smallint) from public, anon, authenticated;
grant execute on function public.claim_continuous_intelligence_shadow_canary(text, text, text, date, smallint) to service_role;

create or replace function public.begin_continuous_intelligence_shadow_canary_attempt(
  p_claim_id text,
  p_execution_id text,
  p_request_fingerprint text,
  p_expected_contract_version text default 'continuous_intelligence_shadow_canary_daily_claim_v1'
)
returns table (
  attempt_status text,
  claim_id text,
  claim_status text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  existing public.continuous_intelligence_shadow_canary_daily_claims%rowtype;
begin
  update public.continuous_intelligence_shadow_canary_daily_claims
  set status = 'attempted',
      provider_attempted = true
  where continuous_intelligence_shadow_canary_daily_claims.claim_id = p_claim_id
    and execution_id = p_execution_id
    and request_fingerprint = p_request_fingerprint
    and contract_version = p_expected_contract_version
    and status = 'claimed'
  returning * into existing;

  if found then
    return query select 'attempt_started'::text, existing.claim_id, existing.status;
    return;
  end if;

  select * into existing
  from public.continuous_intelligence_shadow_canary_daily_claims
  where continuous_intelligence_shadow_canary_daily_claims.claim_id = p_claim_id
  for update;

  if not found or
     existing.execution_id <> p_execution_id or
     existing.request_fingerprint <> p_request_fingerprint or
     existing.contract_version <> p_expected_contract_version then
    return query select 'daily_usage_unavailable'::text, null::text, null::text;
    return;
  end if;

  case existing.status
    when 'attempted' then
      return query select 'attempt_in_progress'::text, existing.claim_id, existing.status;
    when 'completed' then
      return query select 'already_completed'::text, existing.claim_id, existing.status;
    when 'failed' then
      return query select 'already_failed'::text, existing.claim_id, existing.status;
    else
      return query select 'daily_usage_unavailable'::text, null::text, null::text;
  end case;
end;
$$;

revoke all on function public.begin_continuous_intelligence_shadow_canary_attempt(text, text, text, text) from public, anon, authenticated;
grant execute on function public.begin_continuous_intelligence_shadow_canary_attempt(text, text, text, text) to service_role;

create or replace function public.finalize_continuous_intelligence_shadow_canary_attempt(
  p_claim_id text,
  p_execution_id text,
  p_request_fingerprint text,
  p_expected_contract_version text,
  p_terminal_status text,
  p_provider_attempted boolean,
  p_source_receipt_id text,
  p_finalized_at timestamptz
)
returns table (
  finalization_status text,
  claim_id text,
  claim_status text,
  provider_attempted boolean
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  existing public.continuous_intelligence_shadow_canary_daily_claims%rowtype;
begin
  if p_terminal_status not in ('completed', 'failed') or
     p_finalized_at is null or
     p_source_receipt_id is null or
     length(p_source_receipt_id) not between 1 and 128 then
    return query select 'invalid_transition'::text, null::text, null::text, null::boolean;
    return;
  end if;

  update public.continuous_intelligence_shadow_canary_daily_claims
  set status = p_terminal_status,
      provider_attempted = p_provider_attempted,
      source_receipt_id = p_source_receipt_id,
      finalized_at = p_finalized_at
  where continuous_intelligence_shadow_canary_daily_claims.claim_id = p_claim_id
    and execution_id = p_execution_id
    and request_fingerprint = p_request_fingerprint
    and contract_version = p_expected_contract_version
    and status = 'attempted'
  returning * into existing;

  if found then
    return query select 'finalized'::text, existing.claim_id, existing.status, existing.provider_attempted;
    return;
  end if;

  select * into existing
  from public.continuous_intelligence_shadow_canary_daily_claims
  where continuous_intelligence_shadow_canary_daily_claims.claim_id = p_claim_id
  for update;

  if not found or
     existing.execution_id <> p_execution_id or
     existing.request_fingerprint <> p_request_fingerprint or
     existing.contract_version <> p_expected_contract_version then
    return query select 'daily_usage_unavailable'::text, null::text, null::text, null::boolean;
    return;
  end if;

  case existing.status
    when 'completed' then
      return query select 'already_completed'::text, existing.claim_id, existing.status, existing.provider_attempted;
    when 'failed' then
      return query select 'already_failed'::text, existing.claim_id, existing.status, existing.provider_attempted;
    else
      return query select 'invalid_transition'::text, existing.claim_id, null::text, null::boolean;
  end case;
end;
$$;

revoke all on function public.finalize_continuous_intelligence_shadow_canary_attempt(text, text, text, text, text, boolean, text, timestamptz) from public, anon, authenticated;
grant execute on function public.finalize_continuous_intelligence_shadow_canary_attempt(text, text, text, text, text, boolean, text, timestamptz) to service_role;

comment on table public.continuous_intelligence_shadow_canary_daily_claims is
  'Atomic UTC-day capacity claims for the disabled-by-default Action 574 canary. Claims are retained after provider failures and contain no credentials or provider payloads.';
