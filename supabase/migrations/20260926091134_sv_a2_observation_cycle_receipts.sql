-- SV-A.2: retain one owner-bound, versioned receipt for every admitted
-- observation cycle. The existing scheduled_scan_attempts claim remains the
-- invocation/idempotency authority. This relation adds a generic read model
-- that separates trigger, admission, provider request/response, freshness,
-- discovery/evaluation and publication facts without changing any of them.
--
-- The table is server-only. It cannot arm a scheduler, reserve provider
-- credits, call a provider, rank or publish a candidate, or reach paper/live
-- execution.

begin;

create table public.observation_cycle_receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_version text not null default 'observation_cycle_receipt_v1',
  cycle_fingerprint text not null,
  owner_user_id uuid not null,
  source_attempt_fingerprint text not null,
  trigger_kind text not null,
  cycle_status text not null,
  disposition text not null,
  observation_policy_version text not null,
  scheduled_slot_at timestamptz null,
  triggered_at timestamptz not null,
  route_received_at timestamptz not null,
  finalized_at timestamptz null,
  scan_run_fingerprint text null,
  receipt_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint observation_cycle_receipts_owner_cycle_key
    unique (owner_user_id, cycle_fingerprint),
  constraint observation_cycle_receipts_version_check
    check (receipt_version = 'observation_cycle_receipt_v1'),
  constraint observation_cycle_receipts_fingerprint_check
    check (
      cycle_fingerprint ~ '^[a-z0-9_:.\-]{12,240}$'
      and source_attempt_fingerprint ~ '^[a-z0-9_:.\-]{12,240}$'
    ),
  constraint observation_cycle_receipts_trigger_check
    check (trigger_kind in ('netlify_schedule', 'automation_route', 'manual_diagnostic')),
  constraint observation_cycle_receipts_status_check
    check (cycle_status in ('active', 'completed', 'rejected', 'failed')),
  constraint observation_cycle_receipts_disposition_check
    check (
      disposition in (
        'pending',
        'no_request',
        'rejected_data',
        'evaluated',
        'published',
        'no_trade',
        'failed'
      )
    ),
  constraint observation_cycle_receipts_policy_check
    check (observation_policy_version = 'scheduled_scan_observation_cycle_v1'),
  constraint observation_cycle_receipts_time_check
    check (
      triggered_at <= route_received_at
      and (
        (cycle_status = 'active' and finalized_at is null)
        or (
          cycle_status <> 'active'
          and finalized_at is not null
          and route_received_at <= finalized_at
        )
      )
      and (
        scheduled_slot_at is null
        or (
          extract(second from scheduled_slot_at) = 0
          and extract(millisecond from scheduled_slot_at) = 0
          and mod(extract(minute from scheduled_slot_at)::integer, 15) = 0
        )
      )
    ),
  constraint observation_cycle_receipts_payload_check
    check (
      jsonb_typeof(receipt_json) = 'object'
      and pg_column_size(receipt_json) <= 65536
      and receipt_json->>'receipt_version' = receipt_version
      and receipt_json->>'cycle_fingerprint' = cycle_fingerprint
      and receipt_json->>'owner_user_id' = owner_user_id::text
      and receipt_json->>'source_attempt_fingerprint' = source_attempt_fingerprint
      and receipt_json->>'cycle_status' = cycle_status
      and receipt_json->>'disposition' = disposition
      and receipt_json->>'observation_policy_version' = observation_policy_version
      and jsonb_typeof(receipt_json->'trigger') = 'object'
      and jsonb_typeof(receipt_json->'admission') = 'object'
      and jsonb_typeof(receipt_json->'provider_request') = 'object'
      and jsonb_typeof(receipt_json->'provider_response') = 'object'
      and jsonb_typeof(receipt_json->'freshness') = 'object'
      and jsonb_typeof(receipt_json->'discovery_evaluation') = 'object'
      and jsonb_typeof(receipt_json->'publication') = 'object'
      and receipt_json->'authority' = jsonb_build_object(
        'can_arm_scheduler', false,
        'can_call_provider', false,
        'can_change_ranking', false,
        'can_publish', false,
        'can_execute_paper', false,
        'can_execute_broker', false
      )
    )
);

create index observation_cycle_receipts_owner_updated_idx
  on public.observation_cycle_receipts (owner_user_id, updated_at desc);

create index observation_cycle_receipts_owner_slot_idx
  on public.observation_cycle_receipts (owner_user_id, scheduled_slot_at desc)
  where scheduled_slot_at is not null;

create function public.preserve_terminal_observation_cycle_receipt()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if old.cycle_status <> 'active' then
    return old;
  end if;
  return new;
end;
$$;

create trigger preserve_terminal_observation_cycle_receipt
before update on public.observation_cycle_receipts
for each row execute function public.preserve_terminal_observation_cycle_receipt();

alter table public.observation_cycle_receipts enable row level security;
revoke all on table public.observation_cycle_receipts
  from public, anon, authenticated, service_role;
grant select, insert, update on table public.observation_cycle_receipts
  to service_role;
revoke all on function public.preserve_terminal_observation_cycle_receipt()
  from public, anon, authenticated;
grant execute on function public.preserve_terminal_observation_cycle_receipt()
  to service_role;

comment on table public.observation_cycle_receipts is
  'Server-only SV-A.2 generic observation-cycle receipts. Each row distinguishes trigger, admission, provider request/response, freshness, discovery/evaluation and publication/no-trade facts while preserving scheduled_scan_attempts as the invocation authority.';

comment on column public.observation_cycle_receipts.receipt_json is
  'Versioned, bounded observation-cycle read model. Authority flags are fixed false; the receipt reports behavior but cannot authorize scheduler, provider, ranking, publication, paper or broker work.';

comment on function public.preserve_terminal_observation_cycle_receipt() is
  'Makes a terminal observation-cycle receipt immutable so a delayed duplicate route receipt cannot regress it to active or replace its final evidence.';

commit;
