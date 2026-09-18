-- IF-4a: retain a server-owned receipt for every scheduled outcome-evaluation
-- slot.  The receipt describes the evaluator's existing outcome work; it is
-- not a new data feed and cannot affect ranking, publication, positions or
-- broker execution.
begin;

create table if not exists public.scheduled_outcome_evaluation_attempts (
  id uuid primary key default gen_random_uuid(),
  contract_version text not null default 'scheduled_outcome_evaluation_receipt_v1',
  attempt_fingerprint text not null,
  owner_user_id uuid not null,
  market_date date not null,
  scheduled_slot_at timestamptz not null,
  route_received_at timestamptz not null,
  status text not null default 'claimed',
  request_json jsonb not null,
  receipt_json jsonb not null default '{}'::jsonb,
  finalized_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_outcome_evaluation_attempts_contract_check
    check (contract_version = 'scheduled_outcome_evaluation_receipt_v1'),
  constraint scheduled_outcome_evaluation_attempts_owner_fingerprint_key
    unique (owner_user_id, attempt_fingerprint),
  constraint scheduled_outcome_evaluation_attempts_fingerprint_check
    check (attempt_fingerprint ~ '^[a-z0-9_]{12,200}$'),
  constraint scheduled_outcome_evaluation_attempts_status_check
    check (status in ('claimed', 'completed', 'partial', 'blocked', 'failed')),
  constraint scheduled_outcome_evaluation_attempts_slot_check
    check (
      extract(second from scheduled_slot_at) = 0
      and extract(millisecond from scheduled_slot_at) = 0
      and mod(extract(minute from scheduled_slot_at)::integer, 15) = 0
    ),
  constraint scheduled_outcome_evaluation_attempts_request_check
    check (
      jsonb_typeof(request_json) = 'object'
      and pg_column_size(request_json) <= 16384
    ),
  constraint scheduled_outcome_evaluation_attempts_receipt_check
    check (
      jsonb_typeof(receipt_json) = 'object'
      and pg_column_size(receipt_json) <= 65536
      and (
        (
          status = 'claimed'
          and receipt_json = '{}'::jsonb
          and finalized_at is null
        )
        or (
          status <> 'claimed'
          and receipt_json->>'contract_version' = 'scheduled_outcome_evaluation_receipt_v1'
          and finalized_at is not null
        )
      )
    )
);

create index if not exists scheduled_outcome_evaluation_attempts_owner_slot_idx
  on public.scheduled_outcome_evaluation_attempts (
    owner_user_id,
    scheduled_slot_at desc
  );

create index if not exists scheduled_outcome_evaluation_attempts_market_date_idx
  on public.scheduled_outcome_evaluation_attempts (market_date desc);

alter table public.scheduled_outcome_evaluation_attempts enable row level security;
revoke all on table public.scheduled_outcome_evaluation_attempts
  from public, anon, authenticated, service_role;
grant select, insert, update on table public.scheduled_outcome_evaluation_attempts
  to service_role;

comment on table public.scheduled_outcome_evaluation_attempts is
  'Server-only IF-4a receipt for one scheduled outcome-evaluation slot. It claims a slot before provider work and retains the completed evaluation scope, coverage, cost, failures and research-only disposition. It cannot modify ranking, publication, positions or broker state.';

commit;
