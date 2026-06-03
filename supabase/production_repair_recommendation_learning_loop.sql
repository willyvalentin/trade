-- Production repair for Ture recommendation learning-loop persistence.
-- Safe to run in Supabase SQL editor. This is additive only:
-- - creates missing tables
-- - adds missing columns
-- - creates required unique/indexes used by current upserts
-- - grants service_role table access
-- It does not delete or rewrite existing data.

create table if not exists public.recommendation_scan_runs (
  id text primary key,
  run_fingerprint text not null,
  trading_date date null,
  window text not null default 'unknown',
  status text not null default 'unknown',
  observed_at timestamptz not null default now(),
  started_at timestamptz null,
  completed_at timestamptz null,
  market_session_phase text null,
  data_mode text not null default 'unknown',
  scan_observability_status text not null default 'unknown',
  visible_recommendation_count integer not null default 0,
  accepted_count integer not null default 0,
  needs_review_count integer not null default 0,
  rejected_count integer not null default 0,
  incomplete_count integer not null default 0,
  strong_count integer not null default 0,
  valid_count integer not null default 0,
  experimental_count integer not null default 0,
  rejected_tier_count integer not null default 0,
  incomplete_tier_count integer not null default 0,
  unknown_tier_count integer not null default 0,
  window_target_status text not null default 'unknown',
  gap_to_target integer null,
  overflow_above_target integer null,
  ticker_count integer not null default 0,
  duplicate_ticker_count integer null,
  stale_candidate_count integer null,
  incomplete_data_candidate_count integer null,
  scanned_ticker_count integer null,
  raw_candidate_count integer null,
  scan_duration_ms integer null,
  warnings_json jsonb not null default '[]'::jsonb,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recommendation_scan_runs
  add column if not exists run_fingerprint text,
  add column if not exists trading_date date,
  add column if not exists window text not null default 'unknown',
  add column if not exists status text not null default 'unknown',
  add column if not exists observed_at timestamptz not null default now(),
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists market_session_phase text,
  add column if not exists data_mode text not null default 'unknown',
  add column if not exists scan_observability_status text not null default 'unknown',
  add column if not exists visible_recommendation_count integer not null default 0,
  add column if not exists accepted_count integer not null default 0,
  add column if not exists needs_review_count integer not null default 0,
  add column if not exists rejected_count integer not null default 0,
  add column if not exists incomplete_count integer not null default 0,
  add column if not exists strong_count integer not null default 0,
  add column if not exists valid_count integer not null default 0,
  add column if not exists experimental_count integer not null default 0,
  add column if not exists rejected_tier_count integer not null default 0,
  add column if not exists incomplete_tier_count integer not null default 0,
  add column if not exists unknown_tier_count integer not null default 0,
  add column if not exists window_target_status text not null default 'unknown',
  add column if not exists gap_to_target integer,
  add column if not exists overflow_above_target integer,
  add column if not exists ticker_count integer not null default 0,
  add column if not exists duplicate_ticker_count integer,
  add column if not exists stale_candidate_count integer,
  add column if not exists incomplete_data_candidate_count integer,
  add column if not exists scanned_ticker_count integer,
  add column if not exists raw_candidate_count integer,
  add column if not exists scan_duration_ms integer,
  add column if not exists warnings_json jsonb not null default '[]'::jsonb,
  add column if not exists payload_json jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists recommendation_scan_runs_run_fingerprint_idx
  on public.recommendation_scan_runs (run_fingerprint);

create index if not exists recommendation_scan_runs_trading_date_idx
  on public.recommendation_scan_runs (trading_date desc);

create index if not exists recommendation_scan_runs_observed_at_idx
  on public.recommendation_scan_runs (observed_at desc);

create index if not exists recommendation_scan_runs_window_status_idx
  on public.recommendation_scan_runs (window, status);

create table if not exists public.recommendation_snapshots (
  id text primary key,
  snapshot_fingerprint text not null,
  recommendation_id text null,
  scan_run_id text null,
  ticker text null,
  recommended_at timestamptz null,
  window text not null default 'unknown',
  status text not null default 'visible',
  source_mode text not null default 'unknown',
  data_mode text not null default 'unknown',
  market_session_phase text null,
  entry numeric null,
  stop numeric null,
  target numeric null,
  confidence numeric null,
  score numeric null,
  risk_reward numeric null,
  rationale text null,
  payload_json jsonb not null default '{}'::jsonb,
  intake_quality_json jsonb null,
  scan_observability_json jsonb null,
  was_taken boolean not null default false,
  linked_position_id text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recommendation_snapshots
  add column if not exists snapshot_fingerprint text,
  add column if not exists recommendation_id text,
  add column if not exists scan_run_id text,
  add column if not exists ticker text,
  add column if not exists recommended_at timestamptz,
  add column if not exists window text not null default 'unknown',
  add column if not exists status text not null default 'visible',
  add column if not exists source_mode text not null default 'unknown',
  add column if not exists data_mode text not null default 'unknown',
  add column if not exists market_session_phase text,
  add column if not exists entry numeric,
  add column if not exists stop numeric,
  add column if not exists target numeric,
  add column if not exists confidence numeric,
  add column if not exists score numeric,
  add column if not exists risk_reward numeric,
  add column if not exists rationale text,
  add column if not exists payload_json jsonb not null default '{}'::jsonb,
  add column if not exists intake_quality_json jsonb,
  add column if not exists scan_observability_json jsonb,
  add column if not exists was_taken boolean not null default false,
  add column if not exists linked_position_id text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists recommendation_snapshots_snapshot_fingerprint_idx
  on public.recommendation_snapshots (snapshot_fingerprint);

create index if not exists recommendation_snapshots_ticker_created_at_idx
  on public.recommendation_snapshots (ticker, created_at desc);

create index if not exists recommendation_snapshots_recommendation_id_idx
  on public.recommendation_snapshots (recommendation_id);

create index if not exists recommendation_snapshots_scan_run_id_idx
  on public.recommendation_snapshots (scan_run_id);

create index if not exists recommendation_snapshots_status_created_at_idx
  on public.recommendation_snapshots (status, created_at desc);

create table if not exists public.recommendation_batches (
  id text primary key,
  batch_fingerprint text not null,
  trading_date date null,
  window text not null default 'unknown',
  batch_type text not null default 'unknown',
  status text not null default 'unknown',
  serving_decision text null,
  freshness_status text null,
  published_at timestamptz null,
  expires_at timestamptz null,
  scan_run_fingerprint text null,
  recommendation_count integer not null default 0,
  strong_count integer not null default 0,
  valid_count integer not null default 0,
  experimental_count integer not null default 0,
  unknown_tier_count integer not null default 0,
  target_status text not null default 'unknown',
  gap_to_target integer null,
  overflow_above_target integer null,
  data_mode text not null default 'unknown',
  market_session_phase text null,
  warnings_json jsonb not null default '[]'::jsonb,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recommendation_batches
  add column if not exists batch_fingerprint text,
  add column if not exists trading_date date,
  add column if not exists window text not null default 'unknown',
  add column if not exists batch_type text not null default 'unknown',
  add column if not exists status text not null default 'unknown',
  add column if not exists serving_decision text,
  add column if not exists freshness_status text,
  add column if not exists published_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists scan_run_fingerprint text,
  add column if not exists recommendation_count integer not null default 0,
  add column if not exists strong_count integer not null default 0,
  add column if not exists valid_count integer not null default 0,
  add column if not exists experimental_count integer not null default 0,
  add column if not exists unknown_tier_count integer not null default 0,
  add column if not exists target_status text not null default 'unknown',
  add column if not exists gap_to_target integer,
  add column if not exists overflow_above_target integer,
  add column if not exists data_mode text not null default 'unknown',
  add column if not exists market_session_phase text,
  add column if not exists warnings_json jsonb not null default '[]'::jsonb,
  add column if not exists payload_json jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists recommendation_batches_batch_fingerprint_idx
  on public.recommendation_batches (batch_fingerprint);

create index if not exists recommendation_batches_trading_date_idx
  on public.recommendation_batches (trading_date desc);

create index if not exists recommendation_batches_window_status_idx
  on public.recommendation_batches (window, status);

create index if not exists recommendation_batches_published_at_idx
  on public.recommendation_batches (published_at desc);

create index if not exists recommendation_batches_scan_run_fingerprint_idx
  on public.recommendation_batches (scan_run_fingerprint);

create table if not exists public.recommendation_outcomes (
  id text primary key,
  snapshot_id text null,
  snapshot_fingerprint text null,
  recommendation_id text null,
  ticker text null,
  recommended_at timestamptz null,
  evaluated_at timestamptz not null default now(),
  horizon text not null default 'unknown',
  status text not null default 'pending',
  entry_triggered boolean null,
  target_hit boolean null,
  stop_hit boolean null,
  first_terminal_event text not null default 'unknown',
  best_price numeric null,
  worst_price numeric null,
  best_r numeric null,
  worst_r numeric null,
  eod_price numeric null,
  eod_r numeric null,
  payload_json jsonb not null default '{}'::jsonb,
  warnings_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recommendation_outcomes
  add column if not exists snapshot_id text,
  add column if not exists snapshot_fingerprint text,
  add column if not exists recommendation_id text,
  add column if not exists ticker text,
  add column if not exists recommended_at timestamptz,
  add column if not exists evaluated_at timestamptz not null default now(),
  add column if not exists horizon text not null default 'unknown',
  add column if not exists status text not null default 'pending',
  add column if not exists entry_triggered boolean,
  add column if not exists target_hit boolean,
  add column if not exists stop_hit boolean,
  add column if not exists first_terminal_event text not null default 'unknown',
  add column if not exists best_price numeric,
  add column if not exists worst_price numeric,
  add column if not exists best_r numeric,
  add column if not exists worst_r numeric,
  add column if not exists eod_price numeric,
  add column if not exists eod_r numeric,
  add column if not exists payload_json jsonb not null default '{}'::jsonb,
  add column if not exists warnings_json jsonb not null default '[]'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists recommendation_outcomes_snapshot_horizon_idx
  on public.recommendation_outcomes (snapshot_fingerprint, horizon)
  where snapshot_fingerprint is not null;

create index if not exists recommendation_outcomes_ticker_evaluated_at_idx
  on public.recommendation_outcomes (ticker, evaluated_at desc);

create index if not exists recommendation_outcomes_recommendation_id_idx
  on public.recommendation_outcomes (recommendation_id);

create index if not exists recommendation_outcomes_status_evaluated_at_idx
  on public.recommendation_outcomes (status, evaluated_at desc);

grant usage on schema public to service_role;
grant select, insert, update, delete on table
  public.recommendation_scan_runs,
  public.recommendation_snapshots,
  public.recommendation_batches,
  public.recommendation_outcomes
to service_role;

comment on table public.recommendation_scan_runs is
  'Historical recommendation scan runs for pipeline observability and recommendation learning diagnostics.';

comment on table public.recommendation_snapshots is
  'Durable snapshots of visible or diagnostic recommendation rows for outcome tracking and calibration.';

comment on table public.recommendation_batches is
  'Historical recommendation batches served or diagnostically persisted by the recommendation loop.';

comment on table public.recommendation_outcomes is
  'Outcome tracking rows for recommendation snapshots by evaluation horizon.';
