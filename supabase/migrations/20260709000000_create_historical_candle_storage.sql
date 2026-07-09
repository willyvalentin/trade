create table if not exists public.historical_candle_fetch_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  request_type text not null,
  ticker_count integer not null default 0,
  candle_count integer not null default 0,
  interval text not null,
  trading_day_start date null,
  trading_day_end date null,
  requested_at timestamptz not null default now(),
  completed_at timestamptz null,
  status text not null default 'planned',
  error_type text null,
  provider_credits_estimated integer null,
  provider_credits_used integer null,
  cache_hits integer not null default 0,
  cache_misses integer not null default 0,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  constraint historical_candle_fetch_runs_provider_not_empty_check
    check (length(btrim(provider)) > 0),
  constraint historical_candle_fetch_runs_request_type_not_empty_check
    check (length(btrim(request_type)) > 0),
  constraint historical_candle_fetch_runs_ticker_count_non_negative_check
    check (ticker_count >= 0),
  constraint historical_candle_fetch_runs_candle_count_non_negative_check
    check (candle_count >= 0),
  constraint historical_candle_fetch_runs_cache_hits_non_negative_check
    check (cache_hits >= 0),
  constraint historical_candle_fetch_runs_cache_misses_non_negative_check
    check (cache_misses >= 0),
  constraint historical_candle_fetch_runs_provider_credits_estimated_non_negative_check
    check (provider_credits_estimated is null or provider_credits_estimated >= 0),
  constraint historical_candle_fetch_runs_provider_credits_used_non_negative_check
    check (provider_credits_used is null or provider_credits_used >= 0)
);

create table if not exists public.historical_candles (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  ticker text not null,
  interval text not null,
  "timestamp" timestamptz not null,
  trading_day date not null,
  "session" text not null default 'regular',
  timezone text not null default 'America/New_York',
  open numeric not null,
  high numeric not null,
  low numeric not null,
  close numeric not null,
  volume numeric null,
  adjusted boolean not null default false,
  source text not null default 'twelve_data',
  cache_key text not null,
  provider_request_id text null,
  fetch_run_id uuid null references public.historical_candle_fetch_runs(id) on delete set null,
  raw_payload jsonb null,
  metadata jsonb not null default '{}'::jsonb,
  quality_flags text[] not null default '{}'::text[],
  validation_status text not null default 'unknown',
  duplicate_of_id uuid null references public.historical_candles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint historical_candles_unique_provider_ticker_interval_timestamp_adjusted
    unique (provider, ticker, interval, "timestamp", adjusted),
  constraint historical_candles_interval_check
    check (interval in ('1min', '5min', '15min', '30min', '1h', '1day')),
  constraint historical_candles_high_greater_equal_low_check
    check (high >= low),
  constraint historical_candles_high_greater_equal_open_check
    check (high >= open),
  constraint historical_candles_high_greater_equal_close_check
    check (high >= close),
  constraint historical_candles_low_less_equal_open_check
    check (low <= open),
  constraint historical_candles_low_less_equal_close_check
    check (low <= close),
  constraint historical_candles_volume_non_negative_check
    check (volume is null or volume >= 0),
  constraint historical_candles_ticker_not_empty_check
    check (length(btrim(ticker)) > 0),
  constraint historical_candles_provider_not_empty_check
    check (length(btrim(provider)) > 0),
  constraint historical_candles_cache_key_not_empty_check
    check (length(btrim(cache_key)) > 0)
);

create index if not exists historical_candles_ticker_interval_timestamp_idx
  on public.historical_candles (ticker, interval, "timestamp");

create index if not exists historical_candles_provider_ticker_trading_day_idx
  on public.historical_candles (provider, ticker, trading_day);

create index if not exists historical_candles_interval_timestamp_idx
  on public.historical_candles (interval, "timestamp");

create index if not exists historical_candles_fetch_run_id_idx
  on public.historical_candles (fetch_run_id);

create index if not exists historical_candles_validation_status_idx
  on public.historical_candles (validation_status);

create index if not exists historical_candles_cache_key_idx
  on public.historical_candles (cache_key);

create index if not exists historical_candles_trading_day_interval_idx
  on public.historical_candles (trading_day, interval);

create index if not exists historical_candle_fetch_runs_provider_requested_at_idx
  on public.historical_candle_fetch_runs (provider, requested_at);

create index if not exists historical_candle_fetch_runs_status_idx
  on public.historical_candle_fetch_runs (status);

create index if not exists historical_candle_fetch_runs_interval_trading_day_range_idx
  on public.historical_candle_fetch_runs (
    interval,
    trading_day_start,
    trading_day_end
  );

alter table public.historical_candle_fetch_runs
  enable row level security;

alter table public.historical_candles
  enable row level security;

comment on table public.historical_candles is
  'Historical candle cache storage for learning/backfill infrastructure. This migration creates schema only; it adds no provider fetch, candle persistence path, synthetic outcome persistence, scanner behavior change, ranking change, broker path, or Add Trade behavior.';

comment on table public.historical_candle_fetch_runs is
  'Audit table for future historical candle cache fetch planning, cache hits, provider credits, and provider errors. This migration creates schema only and does not implement any fetch job or runtime writer.';

comment on column public.historical_candles.raw_payload is
  'Optional raw provider payload retained for server-side debugging only. Do not expose raw provider payloads in client UI.';

comment on column public.historical_candles.cache_key is
  'Deterministic cache key built from provider, ticker, interval, trading day, session/window, timezone, and adjusted flag.';

comment on column public.historical_candles."timestamp" is
  'Candle timestamp. Replay and signal generation must filter cached candles to the analysis cutoff to avoid lookahead bias.';

comment on column public.historical_candle_fetch_runs.metadata is
  'Internal audit metadata for future fetch/cache diagnostics. Do not store secrets, provider credentials, or arbitrary environment values.';

-- RLS is intentionally enabled with no anon/authenticated/client policies.
-- Service-role/server-only access may bypass RLS, but no runtime writer,
-- provider fetch, backfill replay, scanner use, or UI raw-payload read path is
-- added by this migration. Add explicit policies only after a separate review.
