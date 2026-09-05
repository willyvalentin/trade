-- AI-02 staging-only redacted legacy-outcome evidence.
--
-- This operation is for project pdvzyuhykomwfqyyztru (ture-staging) only.
-- It is deliberately outside supabase/migrations: this schema must never be
-- inferred as a production migration or an application runtime dependency.
-- It creates no writer, route, function callable by users, deployment or
-- evaluation/promotion authority.

create table private.ai_02_legacy_outcome_evidence (
  evidence_id uuid primary key default gen_random_uuid(),
  imported_at timestamptz not null default now(),
  evidence_contract_version text not null
    default 'ai_02_legacy_outcome_evidence_v1',

  -- SHA-256 of the source snapshot fingerprint and horizon. The source
  -- identifier itself must never leave the production read path.
  source_dedupe_sha256 text not null,
  evaluation_day date not null,
  horizon text not null,
  outcome_status text not null,
  terminal_outcome text not null,
  entry_triggered boolean null,
  target_hit boolean null,
  stop_hit boolean null,
  best_r numeric null,
  worst_r numeric null,
  realized_r numeric null,

  evidence_completeness text not null default 'legacy_incomplete',
  evaluation_disposition text not null default 'not_admitted',

  constraint ai_02_legacy_evidence_contract_version_ck
    check (evidence_contract_version = 'ai_02_legacy_outcome_evidence_v1'),
  constraint ai_02_legacy_evidence_dedupe_ck
    check (source_dedupe_sha256 ~ '^[0-9a-f]{64}$'),
  constraint ai_02_legacy_evidence_horizon_ck
    check (length(btrim(horizon)) between 1 and 16),
  constraint ai_02_legacy_evidence_status_ck
    check (length(btrim(outcome_status)) between 1 and 80),
  constraint ai_02_legacy_evidence_terminal_ck
    check (length(btrim(terminal_outcome)) between 1 and 80),
  constraint ai_02_legacy_evidence_completeness_ck
    check (evidence_completeness = 'legacy_incomplete'),
  constraint ai_02_legacy_evidence_disposition_ck
    check (evaluation_disposition = 'not_admitted'),
  constraint ai_02_legacy_evidence_dedupe_uidx
    unique (source_dedupe_sha256)
);

create index ai_02_legacy_evidence_day_horizon_idx
  on private.ai_02_legacy_outcome_evidence (evaluation_day, horizon);

create function private.reject_ai_02_legacy_evidence_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  raise exception 'AI-02 legacy outcome evidence is append-only: % rejected', tg_op
    using errcode = '55000';
end;
$$;

alter function private.reject_ai_02_legacy_evidence_mutation()
  owner to postgres;

revoke all on function private.reject_ai_02_legacy_evidence_mutation()
  from public, anon, authenticated, service_role;

create trigger ai_02_legacy_evidence_append_only
  before update or delete on private.ai_02_legacy_outcome_evidence
  for each row
  execute function private.reject_ai_02_legacy_evidence_mutation();

alter table private.ai_02_legacy_outcome_evidence owner to postgres;
alter table private.ai_02_legacy_outcome_evidence enable row level security;

revoke all privileges on table private.ai_02_legacy_outcome_evidence
  from public, anon, authenticated, service_role;

comment on table private.ai_02_legacy_outcome_evidence is
  'Staging-only append-only redacted legacy outcome evidence for AI-02 data-quality work. It intentionally stores no owner, ticker, source-record identifier, JSON, secret, canonical decision claim, writer authority, evaluator authority or promotion authority.';

comment on column private.ai_02_legacy_outcome_evidence.source_dedupe_sha256 is
  'Opaque SHA-256 dedupe key produced in the authorized production read path. The source snapshot fingerprint itself is never stored in staging.';

comment on column private.ai_02_legacy_outcome_evidence.evaluation_disposition is
  'Fixed not_admitted. This redacted legacy evidence cannot be used for offline evaluation, model/policy promotion or runtime behavior.';
