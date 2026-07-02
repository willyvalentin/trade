create table if not exists public.recommendation_scan_runs (
  id text primary key,
  run_fingerprint text not null unique,
  trading_date date null,
  "window" text not null default 'unknown',
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

create index if not exists recommendation_scan_runs_trading_date_idx
  on public.recommendation_scan_runs (trading_date desc);

create index if not exists recommendation_scan_runs_observed_at_idx
  on public.recommendation_scan_runs (observed_at desc);

create index if not exists recommendation_scan_runs_window_status_idx
  on public.recommendation_scan_runs ("window", status);

comment on table public.recommendation_scan_runs is
  'Historical recommendation scan runs for pipeline observability and recommendation learning diagnostics.';

comment on column public.recommendation_scan_runs.payload_json is
  'Best-effort diagnostic payload for scan observability, target summary, source reality, and visible recommendation set.';
