create table if not exists public.execution_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null,
  lifecycle_id text null,
  intent_id text null,
  recommendation_id text null,
  position_id text null,
  ticker text null,
  action text null,
  mode text null,
  trigger_type text null,
  event_type text not null,
  state_from text null,
  state_to text null,
  source text not null default 'system',
  source_environment text not null default 'local_dev',
  is_mock boolean not null default false,
  is_dev boolean not null default false,
  message text null,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  constraint execution_lifecycle_events_action_check
    check (action is null or action in ('buy', 'sell')),
  constraint execution_lifecycle_events_mode_check
    check (mode is null or mode in ('semi_automatic', 'automatic')),
  constraint execution_lifecycle_events_source_environment_check
    check (source_environment in ('local_dev', 'staging', 'production'))
);

create index if not exists execution_lifecycle_events_created_at_idx
  on public.execution_lifecycle_events (created_at desc);

create index if not exists execution_lifecycle_events_intent_id_idx
  on public.execution_lifecycle_events (intent_id);

create index if not exists execution_lifecycle_events_recommendation_id_idx
  on public.execution_lifecycle_events (recommendation_id);

create index if not exists execution_lifecycle_events_position_id_idx
  on public.execution_lifecycle_events (position_id);

create index if not exists execution_lifecycle_events_ticker_idx
  on public.execution_lifecycle_events (ticker);

create index if not exists execution_lifecycle_events_event_type_idx
  on public.execution_lifecycle_events (event_type);

create index if not exists execution_lifecycle_events_environment_mock_dev_idx
  on public.execution_lifecycle_events (source_environment, is_mock, is_dev);

comment on table public.execution_lifecycle_events is
  'Append-only execution lifecycle and audit events. Draft foundation table only; no app writes are wired in Action 219.';

comment on column public.execution_lifecycle_events.payload is
  'Sanitized event payload. Do not store broker credentials, cookies, raw broker pages, or full browser session data.';

comment on column public.execution_lifecycle_events.metadata is
  'Non-sensitive diagnostic metadata for execution lifecycle events.';

comment on column public.execution_lifecycle_events.user_id is
  'Nullable until the execution persistence auth/user ownership model is finalized.';

create table if not exists public.execution_agent_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid null,
  request_id text not null,
  intent_id text null,
  recommendation_id text null,
  position_id text null,
  ticker text null,
  action text null,
  mode text null,
  broker text not null default 'avanza',
  bridge_transport text null,
  runner_name text null,
  runner_version text null,
  result_status text null,
  broker_result_present boolean not null default false,
  source_environment text not null default 'local_dev',
  is_mock boolean not null default false,
  is_dev boolean not null default false,
  error text null,
  warnings jsonb not null default '[]'::jsonb,
  request_summary jsonb not null default '{}'::jsonb,
  result_summary jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  constraint execution_agent_runs_action_check
    check (action is null or action in ('buy', 'sell')),
  constraint execution_agent_runs_mode_check
    check (mode is null or mode in ('semi_automatic', 'automatic')),
  constraint execution_agent_runs_broker_check
    check (broker in ('avanza')),
  constraint execution_agent_runs_source_environment_check
    check (source_environment in ('local_dev', 'staging', 'production'))
);

create index if not exists execution_agent_runs_request_id_idx
  on public.execution_agent_runs (request_id);

create index if not exists execution_agent_runs_intent_id_idx
  on public.execution_agent_runs (intent_id);

create index if not exists execution_agent_runs_ticker_idx
  on public.execution_agent_runs (ticker);

create index if not exists execution_agent_runs_result_status_idx
  on public.execution_agent_runs (result_status);

create index if not exists execution_agent_runs_created_at_idx
  on public.execution_agent_runs (created_at desc);

create index if not exists execution_agent_runs_environment_mock_dev_idx
  on public.execution_agent_runs (source_environment, is_mock, is_dev);

comment on table public.execution_agent_runs is
  'One row per execution agent or bridge run attempt. Draft diagnostics table only; no app writes are wired in Action 219.';

comment on column public.execution_agent_runs.request_summary is
  'Minimized request summary for diagnostics. Do not store credentials, cookies, or raw broker pages.';

comment on column public.execution_agent_runs.result_summary is
  'Minimized result summary for diagnostics. Broker execution result persistence is intentionally out of scope for this migration.';

comment on column public.execution_agent_runs.user_id is
  'Nullable until the execution persistence auth/user ownership model is finalized.';

create table if not exists public.execution_agent_progress_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null,
  agent_run_id uuid null references public.execution_agent_runs(id) on delete cascade,
  request_id text null,
  intent_id text null,
  event_type text not null,
  lifecycle_event_type text null,
  message text null,
  source_environment text not null default 'local_dev',
  is_mock boolean not null default false,
  is_dev boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  constraint execution_agent_progress_events_source_environment_check
    check (source_environment in ('local_dev', 'staging', 'production'))
);

create index if not exists execution_agent_progress_events_agent_run_id_idx
  on public.execution_agent_progress_events (agent_run_id);

create index if not exists execution_agent_progress_events_request_id_idx
  on public.execution_agent_progress_events (request_id);

create index if not exists execution_agent_progress_events_intent_id_idx
  on public.execution_agent_progress_events (intent_id);

create index if not exists execution_agent_progress_events_event_type_idx
  on public.execution_agent_progress_events (event_type);

create index if not exists execution_agent_progress_events_created_at_idx
  on public.execution_agent_progress_events (created_at desc);

comment on table public.execution_agent_progress_events is
  'Append-only progress events emitted during execution agent or bridge runs. Draft diagnostics table only; no app writes are wired in Action 219.';

comment on column public.execution_agent_progress_events.metadata is
  'Non-sensitive progress metadata. Do not store credentials, cookies, raw broker pages, or full browser session data.';

comment on column public.execution_agent_progress_events.user_id is
  'Nullable until the execution persistence auth/user ownership model is finalized.';

-- RLS is intentionally not enabled in this draft because the current migration set
-- does not define a project-wide auth.uid() ownership convention. Before applying
-- this migration in an environment with user data, decide whether execution
-- persistence is service-route-only, user-owned through auth.uid(), or both.
-- Do not expose these tables through client-writable policies until that design
-- is reviewed.
