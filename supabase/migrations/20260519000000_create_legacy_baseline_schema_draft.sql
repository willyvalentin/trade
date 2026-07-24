-- Draft: legacy baseline schema reconstruction for staging initialization.
--
-- NO APPLY YET.
-- This migration file is a source-controlled draft derived from the reviewed
-- production schema-only/no-data artifact:
-- tmp/supabase-schema-review/trade-production-public-schema-only-20260708.sql
--
-- Scope:
-- - legacy baseline tables required before the existing migration chain can run
-- - no production data
-- - no rows
-- - no INSERT or COPY data
-- - no runtime/API/Trade UI write path
--
-- Do not apply this migration until a separate baseline draft review and
-- staging apply approval gate explicitly approve it.

create table if not exists public.recommendations (
  id uuid default gen_random_uuid() not null,
  created_at timestamp with time zone default now(),
  session_type text default 'morning'::text not null,
  ticker text not null,
  company_name text,
  direction text default 'long'::text not null,
  setup_type text,
  entry_low numeric,
  entry_high numeric,
  stop_loss numeric,
  target_1 numeric,
  target_2 numeric,
  risk_reward numeric,
  confidence text,
  timeframe text,
  thesis text,
  invalidation text,
  reason_to_avoid text,
  status text default 'new'::text not null,
  archived boolean default false not null
);

create table if not exists public.positions (
  id uuid default gen_random_uuid() not null,
  recommendation_id uuid,
  created_at timestamp with time zone default now(),
  ticker text not null,
  company_name text,
  entry_price numeric not null,
  position_size numeric,
  current_stop numeric,
  target_1 numeric,
  target_2 numeric,
  status text default 'open'::text not null,
  latest_recommendation text,
  exit_price numeric,
  closed_at timestamp with time zone,
  pnl numeric,
  pnl_percent numeric,
  r_multiple numeric,
  exit_notes text,
  execution_metadata jsonb
);

create table if not exists public.position_updates (
  id uuid default gen_random_uuid() not null,
  position_id uuid,
  created_at timestamp with time zone default now(),
  action text not null,
  recommendation text,
  explanation text,
  new_stop numeric
);

create table if not exists public.user_settings (
  id uuid default gen_random_uuid() not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  portfolio_size numeric default 100000 not null,
  risk_per_trade_percent numeric default 0.5 not null,
  max_recommendations_per_session integer default 5 not null,
  max_open_positions integer default 5 not null,
  preferred_timeframe text default '1–5 days'::text not null,
  long_only boolean default true not null
);

create table if not exists public.scanner_cache (
  id uuid default gen_random_uuid() not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  ticker text not null,
  latest_close numeric,
  ma20 numeric,
  ma50 numeric,
  high_20d numeric,
  volume_ratio numeric,
  distance_to_20d_high numeric,
  change_5d_percent numeric,
  proposed_entry_low numeric,
  proposed_entry_high numeric,
  proposed_stop_loss numeric,
  proposed_target_1 numeric,
  proposed_target_2 numeric,
  proposed_risk_reward numeric,
  trend_context text,
  volume_context text,
  raw jsonb
);

create table if not exists public.scheduled_scan_runs (
  id uuid default gen_random_uuid() not null,
  created_at timestamp with time zone default now(),
  scan_date text not null,
  session_type text not null,
  status text default 'completed'::text not null,
  recommendations_created integer default 0 not null,
  message text
);

create table if not exists public.market_calendar_cache (
  id uuid default gen_random_uuid() not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  cache_date text not null,
  provider text default 'twelve_data'::text not null,
  is_open_day boolean not null,
  reason text,
  day_type text not null,
  market_open_time text,
  market_close_time text,
  raw jsonb
);

create table if not exists public.market_regime_snapshots (
  id uuid default gen_random_uuid() not null,
  created_at timestamp with time zone default now(),
  regime text not null,
  summary text,
  spy_close numeric,
  spy_ma20 numeric,
  spy_ma50 numeric,
  spy_change_5d_percent numeric,
  spy_above_ma20 boolean,
  spy_above_ma50 boolean,
  qqq_close numeric,
  qqq_ma20 numeric,
  qqq_ma50 numeric,
  qqq_change_5d_percent numeric,
  qqq_above_ma20 boolean,
  qqq_above_ma50 boolean
);

alter table only public.recommendations
  add constraint recommendations_pkey primary key (id);

alter table only public.positions
  add constraint positions_pkey primary key (id);

alter table only public.position_updates
  add constraint position_updates_pkey primary key (id);

alter table only public.user_settings
  add constraint user_settings_pkey primary key (id);

alter table only public.scanner_cache
  add constraint scanner_cache_pkey primary key (id);

alter table only public.scanner_cache
  add constraint scanner_cache_ticker_key unique (ticker);

alter table only public.scheduled_scan_runs
  add constraint scheduled_scan_runs_pkey primary key (id);

alter table only public.market_calendar_cache
  add constraint market_calendar_cache_pkey primary key (id);

alter table only public.market_regime_snapshots
  add constraint market_regime_snapshots_pkey primary key (id);

create unique index if not exists scheduled_scan_runs_unique_day_session
  on public.scheduled_scan_runs using btree (scan_date, session_type);

create unique index if not exists market_calendar_cache_unique_date_provider
  on public.market_calendar_cache using btree (cache_date, provider);

alter table only public.positions
  add constraint positions_recommendation_id_fkey
  foreign key (recommendation_id)
  references public.recommendations(id)
  on delete set null;

alter table only public.position_updates
  add constraint position_updates_position_id_fkey
  foreign key (position_id)
  references public.positions(id)
  on delete cascade;

create policy "Allow public insert recommendations"
  on public.recommendations
  for insert
  with check (true);

create policy "Allow public read recommendations"
  on public.recommendations
  for select
  using (true);

create policy "Allow public update recommendations"
  on public.recommendations
  for update
  using (true)
  with check (true);

create policy "Allow public insert positions"
  on public.positions
  for insert
  with check (true);

create policy "Allow public read positions"
  on public.positions
  for select
  using (true);

create policy "Allow public update positions"
  on public.positions
  for update
  using (true)
  with check (true);

create policy "Allow public insert position updates"
  on public.position_updates
  for insert
  with check (true);

create policy "Allow public read position updates"
  on public.position_updates
  for select
  using (true);

create policy "Allow public insert user settings"
  on public.user_settings
  for insert
  with check (true);

create policy "Allow public read user settings"
  on public.user_settings
  for select
  using (true);

create policy "Allow public update user settings"
  on public.user_settings
  for update
  using (true)
  with check (true);

create policy "Allow public insert scanner cache"
  on public.scanner_cache
  for insert
  with check (true);

create policy "Allow public read scanner cache"
  on public.scanner_cache
  for select
  using (true);

create policy "Allow public update scanner cache"
  on public.scanner_cache
  for update
  using (true)
  with check (true);

create policy "Allow public insert market calendar cache"
  on public.market_calendar_cache
  for insert
  with check (true);

create policy "Allow public read market calendar cache"
  on public.market_calendar_cache
  for select
  using (true);

create policy "Allow public update market calendar cache"
  on public.market_calendar_cache
  for update
  using (true)
  with check (true);

create policy "Allow public insert market regime snapshots"
  on public.market_regime_snapshots
  for insert
  with check (true);

create policy "Allow public read market regime snapshots"
  on public.market_regime_snapshots
  for select
  using (true);

alter table public.recommendations enable row level security;
alter table public.positions enable row level security;
alter table public.position_updates enable row level security;
alter table public.user_settings enable row level security;
alter table public.scanner_cache enable row level security;
alter table public.market_calendar_cache enable row level security;
alter table public.market_regime_snapshots enable row level security;

grant all on table public.recommendations to anon;
grant all on table public.recommendations to authenticated;
grant all on table public.recommendations to service_role;

grant all on table public.positions to anon;
grant all on table public.positions to authenticated;
grant all on table public.positions to service_role;

grant all on table public.position_updates to anon;
grant all on table public.position_updates to authenticated;
grant all on table public.position_updates to service_role;

grant all on table public.user_settings to anon;
grant all on table public.user_settings to authenticated;
grant all on table public.user_settings to service_role;

grant all on table public.scanner_cache to anon;
grant all on table public.scanner_cache to authenticated;
grant all on table public.scanner_cache to service_role;

grant all on table public.scheduled_scan_runs to anon;
grant all on table public.scheduled_scan_runs to authenticated;
grant all on table public.scheduled_scan_runs to service_role;

grant all on table public.market_calendar_cache to anon;
grant all on table public.market_calendar_cache to authenticated;
grant all on table public.market_calendar_cache to service_role;

grant all on table public.market_regime_snapshots to anon;
grant all on table public.market_regime_snapshots to authenticated;
grant all on table public.market_regime_snapshots to service_role;
