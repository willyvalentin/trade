create table if not exists public.execution_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid null,
  account_id text null,
  broker text not null,
  broker_order_id text null,
  broker_confirmation_id text null,
  broker_result_id uuid null,
  handoff_session_id text null,
  planning_snapshot_id text null,
  source_recommendation_id text null,
  source_position_id text null,
  ticker text not null,
  instrument_id text null,
  instrument_name text null,
  market text null,
  instrument_type text null,
  currency text null,
  side text not null,
  execution_phase text not null,
  execution_mode text not null,
  quantity numeric not null,
  price numeric not null,
  fees numeric null,
  gross_amount numeric null,
  net_amount numeric null,
  confirmed_at timestamptz not null,
  captured_at timestamptz null,
  idempotency_key text not null,
  record_fingerprint text not null,
  source_fingerprint text not null,
  broker_result_fingerprint text null,
  source_environment text not null,
  is_mock boolean not null default false,
  is_dev boolean not null default false,
  validation_status text not null,
  validation_errors jsonb not null default '[]'::jsonb,
  validation_warnings jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  audit_metadata jsonb not null default '{}'::jsonb,
  constraint execution_records_side_check
    check (side in ('buy', 'sell')),
  constraint execution_records_execution_phase_check
    check (execution_phase in ('entry', 'exit')),
  constraint execution_records_execution_mode_check
    check (execution_mode in ('semi_automatic', 'automatic')),
  constraint execution_records_broker_check
    check (broker in ('avanza')),
  constraint execution_records_source_environment_check
    check (source_environment in ('local_dev', 'staging', 'production')),
  constraint execution_records_validation_status_check
    check (validation_status in ('eligible', 'persisted', 'duplicate', 'needs_review', 'rejected')),
  constraint execution_records_quantity_positive_check
    check (quantity > 0),
  constraint execution_records_price_positive_check
    check (price > 0),
  constraint execution_records_fees_non_negative_check
    check (fees is null or fees >= 0),
  constraint execution_records_gross_amount_non_negative_check
    check (gross_amount is null or gross_amount >= 0),
  constraint execution_records_net_amount_non_negative_check
    check (net_amount is null or net_amount >= 0),
  constraint execution_records_captured_at_sane_check
    check (captured_at is null or captured_at >= confirmed_at - interval '1 day')
);

create unique index if not exists execution_records_idempotency_key_uidx
  on public.execution_records (idempotency_key);

create unique index if not exists execution_records_record_fingerprint_uidx
  on public.execution_records (record_fingerprint);

create unique index if not exists execution_records_broker_confirmation_uidx
  on public.execution_records (broker, broker_confirmation_id)
  where broker_confirmation_id is not null
    and is_mock = false
    and is_dev = false;

create unique index if not exists execution_records_broker_order_confirmed_at_uidx
  on public.execution_records (broker, broker_order_id, confirmed_at)
  where broker_order_id is not null
    and broker_confirmation_id is null
    and is_mock = false
    and is_dev = false;

create unique index if not exists execution_records_broker_result_id_uidx
  on public.execution_records (broker_result_id)
  where broker_result_id is not null;

create index if not exists execution_records_user_created_at_idx
  on public.execution_records (user_id, created_at desc);

create index if not exists execution_records_account_created_at_idx
  on public.execution_records (account_id, created_at desc);

create index if not exists execution_records_ticker_confirmed_at_idx
  on public.execution_records (ticker, confirmed_at desc);

create index if not exists execution_records_broker_order_id_idx
  on public.execution_records (broker, broker_order_id)
  where broker_order_id is not null;

create index if not exists execution_records_broker_confirmation_id_idx
  on public.execution_records (broker, broker_confirmation_id)
  where broker_confirmation_id is not null;

create index if not exists execution_records_source_recommendation_idx
  on public.execution_records (source_recommendation_id)
  where source_recommendation_id is not null;

create index if not exists execution_records_source_position_idx
  on public.execution_records (source_position_id)
  where source_position_id is not null;

create index if not exists execution_records_confirmed_at_idx
  on public.execution_records (confirmed_at desc);

create index if not exists execution_records_created_at_idx
  on public.execution_records (created_at desc);

create index if not exists execution_records_environment_mock_dev_idx
  on public.execution_records (source_environment, is_mock, is_dev);

comment on table public.execution_records is
  'Draft normalized execution record table. Schema only; no app writes, trade mutations, audit appends, broker result creation, or Avanza automation are implemented by this migration draft.';

comment on column public.execution_records.user_id is
  'Nullable until the execution record auth/user ownership model is finalized. Production use requires reviewed RLS or server-only write policy.';

comment on column public.execution_records.account_id is
  'Optional broker/account scope. Final ownership semantics must be reviewed before production writes.';

comment on column public.execution_records.broker_result_id is
  'Optional future reference to a broker execution result evidence table. No broker_execution_results table is created by this draft.';

comment on column public.execution_records.metadata is
  'Minimized non-sensitive metadata. Do not store broker credentials, cookies, raw broker pages, full browser session data, or 2FA material.';

comment on column public.execution_records.audit_metadata is
  'Audit linkage metadata only. This draft does not append audit events or wire audit persistence.';

-- RLS is intentionally not enabled in this draft because the project-wide
-- auth.uid(), user_id, and account ownership model for execution records is not
-- finalized. Production writes should be server-only until RLS policies,
-- ownership, idempotency lookup, and duplicate handling are reviewed.
-- Do not create permissive client insert/update policies for this table.
