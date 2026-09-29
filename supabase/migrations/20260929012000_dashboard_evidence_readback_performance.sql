-- Keep the authenticated dashboard and observation-series evidence readback
-- inside PostgREST's statement budget as the durable evidence corpus grows.
-- These indexes are read-path only: they do not change ranking, publication,
-- provider usage, recommendation policy, or broker behavior.

create index if not exists recommendation_batches_owner_published_at_nulls_last_idx
  on public.recommendation_batches (
    owner_user_id,
    published_at desc nulls last
  );

create index if not exists scheduled_scan_attempts_observation_series_latest_idx
  on public.scheduled_scan_attempts (
    source,
    mode,
    scheduled_function_fired_at desc nulls last
  )
  where payload_json @> '{"observation_series_control":{"control_version":"observation_series_control_v1"}}'::jsonb;

comment on index public.recommendation_batches_owner_published_at_nulls_last_idx is
  'Read-path index for the latest owner-bound recommendation batches using the dashboard null ordering.';

comment on index public.scheduled_scan_attempts_observation_series_latest_idx is
  'Read-path index for the latest durable observation-series control attempt; grants no scheduling or provider authority.';
