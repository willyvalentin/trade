create table if not exists public.bounded_shadow_collector_proof_audits (
  id uuid primary key default gen_random_uuid(),
  receipt_id text not null unique,
  contract_version text not null,
  build_marker text not null,
  entry_kind text not null,
  daily_claim_id text null,
  daily_claim_status text null,
  provider_metadata_status text not null,
  generated_at timestamptz not null,
  created_at timestamptz not null default now(),
  request_fingerprint text not null,
  ticker text not null,
  interval text not null,
  requested_start timestamptz not null,
  requested_end timestamptz not null,
  execution_status text not null,
  primary_result_category text not null,
  provider_attempt_occurred boolean not null,
  provider_request_count smallint not null,
  provider_credit_ceiling smallint not null,
  estimated_credits smallint null,
  actual_credits smallint null,
  actual_credits_known boolean not null,
  candle_count integer null,
  first_candle_at timestamptz null,
  last_candle_at timestamptz null,
  provider_status_category text null,
  fallback_used boolean null,
  retry_count smallint null,
  rate_limited boolean null,
  timeout_occurred boolean not null,
  provider_response_structurally_valid boolean null,
  planner_contract text null,
  planner_version text null,
  planner_session text null,
  planner_workload_id text null,
  planner_workload_class text null,
  planner_rest_layer text null,
  planner_demand_source text null,
  planner_requested_credits smallint null,
  planner_allocated_credits smallint null,
  proof_executable_credits smallint null,
  hard_reserve_preserved boolean not null,
  execution_ready_reserve_consumed boolean not null default false,
  operator_authorization_verified boolean not null,
  authorization_consumed boolean not null,
  authorization_request_bound boolean not null,
  authorization_single_use boolean not null,
  safe_blocker_or_failure_category text null,
  safe_operator_message text not null,
  durable boolean not null default true,
  process_local_only boolean not null default false,
  persisted boolean not null default true,
  shared_cache_mutated boolean not null,
  supabase_writes_executed boolean not null,
  schedule_changes boolean not null,
  recommendation_changes boolean not null,
  scanner_changes boolean not null,
  ranking_changes boolean not null,
  confidence_changes boolean not null,
  execution_or_broker_actions boolean not null,
  constraint bounded_shadow_collector_proof_audits_receipt_id_length_check
    check (length(receipt_id) between 1 and 128),
  constraint bounded_shadow_collector_proof_audits_ticker_length_check
    check (length(ticker) between 1 and 16),
  constraint bounded_shadow_collector_proof_audits_interval_check
    check (interval in ('5min', '15min')),
  constraint bounded_shadow_collector_proof_audits_entry_kind_check
    check (entry_kind in ('bounded_manual_proof', 'scheduled_shadow_collector_canary')),
  constraint bounded_shadow_collector_proof_audits_claim_kind_check
    check (
      (entry_kind = 'bounded_manual_proof' and daily_claim_id is null and daily_claim_status is null) or
      (entry_kind = 'scheduled_shadow_collector_canary' and daily_claim_id is not null and daily_claim_status in ('claimed', 'attempted', 'completed', 'failed'))
    ),
  constraint bounded_shadow_collector_proof_audits_provider_metadata_check
    check (provider_metadata_status in ('within_budget', 'approaching_limit', 'unresolved')),
  constraint bounded_shadow_collector_proof_audits_execution_status_check
    check (execution_status in ('executed', 'blocked', 'failed')),
  constraint bounded_shadow_collector_proof_audits_category_check
    check (primary_result_category in (
      'blocked_before_provider_attempt',
      'provider_success_with_candles',
      'provider_success_empty',
      'provider_timeout',
      'provider_failure',
      'provider_response_invalid',
      'internal_execution_failure'
    )),
  constraint bounded_shadow_collector_proof_audits_provider_request_count_check
    check (provider_request_count between 0 and 1),
  constraint bounded_shadow_collector_proof_audits_provider_attempt_check
    check (
      (provider_attempt_occurred = true and provider_request_count = 1) or
      (provider_attempt_occurred = false and provider_request_count = 0)
    ),
  constraint bounded_shadow_collector_proof_audits_provider_credit_ceiling_check
    check (provider_credit_ceiling = 1),
  constraint bounded_shadow_collector_proof_audits_estimated_credits_check
    check (estimated_credits is null or estimated_credits between 0 and 1),
  constraint bounded_shadow_collector_proof_audits_actual_credits_check
    check (actual_credits is null or actual_credits between 0 and 1),
  constraint bounded_shadow_collector_proof_audits_actual_credits_known_check
    check ((actual_credits is null and actual_credits_known = false) or
      (actual_credits is not null and actual_credits_known = true)),
  constraint bounded_shadow_collector_proof_audits_retry_count_check
    check (retry_count is null or retry_count between 0 and 1),
  constraint bounded_shadow_collector_proof_audits_success_retry_count_check
    check (
      execution_status <> 'executed' or retry_count = 0
    ),
  constraint bounded_shadow_collector_proof_audits_candle_count_check
    check (candle_count is null or candle_count >= 0),
  constraint bounded_shadow_collector_proof_audits_proof_credits_check
    check (proof_executable_credits is null or proof_executable_credits = 1),
  constraint bounded_shadow_collector_proof_audits_execution_ready_reserve_check
    check (execution_ready_reserve_consumed = false),
  constraint bounded_shadow_collector_proof_audits_safe_text_length_check
    check (length(safe_operator_message) between 1 and 240),
  constraint bounded_shadow_collector_proof_audits_safe_operator_message_check
    check (safe_operator_message in (
      'Bounded proof blocked before provider attempt.',
      'Bounded proof completed with sanitized candle aggregates.',
      'Bounded proof completed with a confirmed valid empty provider result.',
      'Bounded proof provider request timed out.',
      'Bounded proof provider response was rejected safely.',
      'Bounded proof provider request failed safely.',
      'Bounded proof internal execution failed safely.'
      ,'Scheduled shadow canary blocked before provider attempt.'
      ,'Scheduled shadow canary completed with sanitized candle aggregates.'
      ,'Scheduled shadow canary completed with a confirmed valid empty provider result.'
      ,'Scheduled shadow canary provider request timed out.'
      ,'Scheduled shadow canary provider response was rejected safely.'
      ,'Scheduled shadow canary provider request failed safely.'
      ,'Scheduled shadow canary internal execution failed safely.'
    )),
  constraint bounded_shadow_collector_proof_audits_safe_category_length_check
    check (safe_blocker_or_failure_category is null or length(safe_blocker_or_failure_category) between 1 and 80),
  constraint bounded_shadow_collector_proof_audits_durability_check
    check (durable = true and process_local_only = false and persisted = true),
  constraint bounded_shadow_collector_proof_audits_no_effect_check
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

create index if not exists bounded_shadow_collector_proof_audits_generated_at_idx
  on public.bounded_shadow_collector_proof_audits (generated_at desc);

alter table public.bounded_shadow_collector_proof_audits enable row level security;

comment on table public.bounded_shadow_collector_proof_audits is
  'Durable sanitized Action 571 bounded-proof receipts only. Never store candles, raw provider responses, credentials, tokens, token hashes, URLs, stack traces, or arbitrary error text.';

comment on column public.bounded_shadow_collector_proof_audits.supabase_writes_executed is
  'Receipt fact: the bounded proof itself did not write Supabase. The audit row is the separately authorized durable audit write.';
