create table if not exists public.continuous_intelligence_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  ledger_entry_id text not null unique,
  contract_version text not null,
  generated_at timestamptz not null,
  created_at timestamptz not null default now(),
  source_receipt_id text not null unique,
  entry_kind text not null,
  request_fingerprint text not null,
  provider text not null,
  ticker text not null,
  interval text not null,
  requested_start timestamptz not null,
  requested_end timestamptz not null,
  provider_request_count smallint not null,
  planner_requested_credits smallint null,
  planner_allocated_credits smallint null,
  proof_executable_credits smallint null,
  provider_estimated_credits smallint null,
  provider_reported_actual_credits smallint null,
  actual_credits_known boolean not null,
  reconciled_credits smallint null,
  reconciliation_status text not null,
  reconciliation_source text not null,
  normal_capacity_credits_charged smallint null,
  reserve_credits_charged smallint not null default 0,
  hard_reserve_preserved boolean not null,
  execution_ready_reserve_consumed boolean not null default false,
  policy_total_credits smallint not null,
  policy_hard_reserve_credits smallint not null,
  policy_normal_planned_max_credits smallint not null,
  provider_status_category text null,
  execution_result_category text not null,
  durable_audit_persisted boolean not null,
  safe_note_category text not null,
  shared_cache_mutated boolean not null,
  supabase_writes_executed boolean not null,
  schedule_changes boolean not null,
  recommendation_changes boolean not null,
  scanner_changes boolean not null,
  ranking_changes boolean not null,
  confidence_changes boolean not null,
  execution_or_broker_actions boolean not null,
  constraint continuous_intelligence_credit_ledger_contract_check
    check (contract_version = 'continuous_intelligence_credit_ledger_v1'),
  constraint continuous_intelligence_credit_ledger_entry_id_length_check
    check (length(ledger_entry_id) between 1 and 160),
  constraint continuous_intelligence_credit_ledger_receipt_id_length_check
    check (length(source_receipt_id) between 1 and 128),
  constraint continuous_intelligence_credit_ledger_ticker_length_check
    check (length(ticker) between 1 and 16),
  constraint continuous_intelligence_credit_ledger_provider_check
    check (provider = 'twelve_data'),
  constraint continuous_intelligence_credit_ledger_entry_kind_check
    check (entry_kind in ('bounded_manual_proof', 'scheduled_shadow_collector_canary')),
  constraint continuous_intelligence_credit_ledger_interval_check
    check (interval in ('5min', '15min')),
  constraint continuous_intelligence_credit_ledger_request_count_check
    check (provider_request_count between 0 and 1),
  constraint continuous_intelligence_credit_ledger_planner_requested_check
    check (planner_requested_credits is null or planner_requested_credits between 0 and 1),
  constraint continuous_intelligence_credit_ledger_planner_allocated_check
    check (planner_allocated_credits is null or planner_allocated_credits between 0 and 1),
  constraint continuous_intelligence_credit_ledger_proof_credits_check
    check (proof_executable_credits is null or proof_executable_credits = 1),
  constraint continuous_intelligence_credit_ledger_estimated_check
    check (provider_estimated_credits is null or provider_estimated_credits between 0 and 1),
  constraint continuous_intelligence_credit_ledger_reported_actual_check
    check (provider_reported_actual_credits is null or provider_reported_actual_credits between 0 and 1),
  constraint continuous_intelligence_credit_ledger_reconciled_check
    check (reconciled_credits is null or reconciled_credits between 0 and 1),
  constraint continuous_intelligence_credit_ledger_normal_charge_check
    check (normal_capacity_credits_charged is null or normal_capacity_credits_charged between 0 and 1),
  constraint continuous_intelligence_credit_ledger_reserve_charge_check
    check (reserve_credits_charged = 0),
  constraint continuous_intelligence_credit_ledger_execution_ready_reserve_check
    check (execution_ready_reserve_consumed = false),
  constraint continuous_intelligence_credit_ledger_policy_check
    check (
      policy_total_credits = 377 and
      policy_hard_reserve_credits = 57 and
      policy_normal_planned_max_credits = 320
    ),
  constraint continuous_intelligence_credit_ledger_reconciliation_status_check
    check (reconciliation_status in (
      'estimated_only',
      'provider_reported',
      'verified_from_provider_usage_snapshot',
      'conflict_requires_review',
      'not_chargeable',
      'reconciliation_unavailable'
    )),
  constraint continuous_intelligence_credit_ledger_reconciliation_source_check
    check (reconciliation_source in ('none', 'provider_reported', 'provider_usage_snapshot')),
  constraint continuous_intelligence_credit_ledger_no_effect_check
    check (
      shared_cache_mutated = false and
      supabase_writes_executed = false and
      schedule_changes = false and
      recommendation_changes = false and
      scanner_changes = false and
      ranking_changes = false and
      confidence_changes = false and
      execution_or_broker_actions = false
    )
);

create index if not exists continuous_intelligence_credit_ledger_generated_at_idx
  on public.continuous_intelligence_credit_ledger (generated_at desc);

alter table public.continuous_intelligence_credit_ledger enable row level security;

comment on table public.continuous_intelligence_credit_ledger is
  'Sanitized Action 573 provider-credit reconciliation metadata only. Never stores candles, OHLCV, provider payloads, authorization data, credentials, URLs, stack traces, arbitrary logs, or error blobs.';
