-- AI-02 authorized production read for staging-only legacy evidence.
--
-- Execute only against Trade production (ekdyopdrrkphlrsilyoo) after the
-- staging-only schema operation has been reviewed. This query returns no owner
-- identifier, ticker, source-record identifier, JSON payload, warning, secret
-- or broker field. The opaque dedupe key is computed in production so the raw
-- snapshot fingerprint never appears in the returned result.

select
  encode(
    digest(snapshot_fingerprint || E'\\x1f' || horizon, 'sha256'),
    'hex'
  ) as source_dedupe_sha256,
  evaluated_at::date as evaluation_day,
  horizon,
  status as outcome_status,
  first_terminal_event as terminal_outcome,
  entry_triggered,
  target_hit,
  stop_hit,
  best_r,
  worst_r,
  eod_r as realized_r,
  'legacy_incomplete'::text as evidence_completeness,
  'not_admitted'::text as evaluation_disposition
from public.recommendation_outcomes
where snapshot_fingerprint is not null
order by evaluated_at asc, snapshot_fingerprint asc, horizon asc
limit 500;
