create table if not exists public.recommendation_snapshots (
  id text primary key,
  snapshot_fingerprint text not null unique,
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

create index if not exists recommendation_snapshots_ticker_created_at_idx
  on public.recommendation_snapshots (ticker, created_at desc);

create index if not exists recommendation_snapshots_recommendation_id_idx
  on public.recommendation_snapshots (recommendation_id);

create index if not exists recommendation_snapshots_scan_run_id_idx
  on public.recommendation_snapshots (scan_run_id);

create index if not exists recommendation_snapshots_status_created_at_idx
  on public.recommendation_snapshots (status, created_at desc);

comment on table public.recommendation_snapshots is
  'Durable v1 snapshots of every visible recommendation for later outcome tracking, calibration, and taken-vs-ignored analysis.';

comment on column public.recommendation_snapshots.payload_json is
  'Full best-effort snapshot payload. Optional fields are null/omitted when unavailable; outcome tracking is intentionally not stored in v1.';
