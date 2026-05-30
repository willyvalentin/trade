create table if not exists public.recommendation_batches (
  id text primary key,
  batch_fingerprint text not null unique,
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

create index if not exists recommendation_batches_trading_date_idx
  on public.recommendation_batches (trading_date desc);

create index if not exists recommendation_batches_window_status_idx
  on public.recommendation_batches (window, status);

create index if not exists recommendation_batches_published_at_idx
  on public.recommendation_batches (published_at desc);

create index if not exists recommendation_batches_scan_run_fingerprint_idx
  on public.recommendation_batches (scan_run_fingerprint);

comment on table public.recommendation_batches is
  'Historical official recommendation batches served to the user during day-trade windows.';

comment on column public.recommendation_batches.payload_json is
  'Best-effort batch payload including recommendation snapshots, serving cadence, ranking summary, and OpenAI reality guard metadata.';
