create unique index if not exists recommendation_outcomes_snapshot_horizon_uidx
  on public.recommendation_outcomes (snapshot_fingerprint, horizon);

comment on index public.recommendation_outcomes_snapshot_horizon_uidx is
  'Non-partial unique index required by Supabase/PostgREST upsert onConflict=snapshot_fingerprint,horizon.';
