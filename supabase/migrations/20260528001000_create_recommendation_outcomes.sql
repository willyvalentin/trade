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

create unique index if not exists recommendation_outcomes_snapshot_horizon_idx
  on public.recommendation_outcomes (snapshot_fingerprint, horizon)
  where snapshot_fingerprint is not null;

create index if not exists recommendation_outcomes_ticker_evaluated_at_idx
  on public.recommendation_outcomes (ticker, evaluated_at desc);

create index if not exists recommendation_outcomes_recommendation_id_idx
  on public.recommendation_outcomes (recommendation_id);

create index if not exists recommendation_outcomes_status_evaluated_at_idx
  on public.recommendation_outcomes (status, evaluated_at desc);

comment on table public.recommendation_outcomes is
  'Outcome tracking v1 for recommendation snapshots. One row per snapshot and horizon; target/stop sequencing is stored only when market data can support it.';

comment on column public.recommendation_outcomes.payload_json is
  'Computation metadata such as candle count, partial quote availability, risk per share, source, and provider.';

comment on column public.recommendation_outcomes.warnings_json is
  'Warnings explaining missing candle data, incomplete evaluation, or ambiguous intrabar sequencing.';
