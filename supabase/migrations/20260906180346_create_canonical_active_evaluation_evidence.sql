-- AI-02.10: additive active canonical-evidence storage.
--
-- This migration is a local, reviewed schema package only. It must not be
-- applied to staging or production without a separately authorized action.
-- It deliberately leaves canonical_evaluation_decisions and every v1 row,
-- constraint, trigger and privilege unchanged.

create table public.canonical_active_evaluation_evidence (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),

  active_evidence_contract_version text not null,
  storage_contract_version text not null,
  canonical_identity text not null,
  active_evidence_identity text not null,
  semantic_payload_sha256 text not null,
  idempotency_key text not null,

  source_kind text not null,
  source_receipt_identity text not null,
  source_receipt_sha256 text not null,
  producer_decision_id text not null,
  decision_timestamp timestamptz not null,
  sample_type text not null,

  primary_horizon text not null,
  primary_outcome_id text not null,
  diagnostic_outcome_ids text[] not null,
  reproducible boolean not null,
  quality_metrics_eligible boolean not null,
  persistence_envelope jsonb not null,

  constraint caee_contract_version_ck
    check (
      active_evidence_contract_version = 'canonical_active_evaluation_evidence_v2'
      and storage_contract_version = 'canonical_active_evaluation_storage_payload_v2'
    ),
  constraint caee_canonical_identity_ck
    check (
      length(canonical_identity) between 1 and 1024
      and canonical_identity ~ '^rec_decision:v1:[^:]+:[^:]+:[0-9]+$'
    ),
  constraint caee_active_identity_ck
    check (
      active_evidence_identity = 'active_evidence:v2:' || canonical_identity
      and idempotency_key =
        'canonical_active_evidence:v2:' || active_evidence_identity
    ),
  constraint caee_identity_unique unique (canonical_identity),
  constraint caee_active_identity_unique unique (active_evidence_identity),
  constraint caee_semantic_digest_ck
    check (
      semantic_payload_sha256 ~ '^[0-9a-f]{64}$'
      and source_receipt_sha256 ~ '^[0-9a-f]{64}$'
    ),
  constraint caee_required_text_ck
    check (
      length(btrim(source_receipt_identity)) between 1 and 1024
      and length(btrim(producer_decision_id)) between 1 and 512
    ),
  constraint caee_source_kind_ck
    check (
      source_kind = 'server_owned_completed_recommendation_outcome_bundle'
    ),
  constraint caee_completed_sample_ck
    check (sample_type in ('visible', 'research_only')),
  constraint caee_complete_evaluation_ck
    check (
      primary_horizon = '60m'
      and cardinality(diagnostic_outcome_ids) = 2
      and length(btrim(primary_outcome_id)) between 1 and 1024
      and diagnostic_outcome_ids[1] is not null
      and diagnostic_outcome_ids[2] is not null
      and length(btrim(diagnostic_outcome_ids[1])) between 1 and 1024
      and length(btrim(diagnostic_outcome_ids[2])) between 1 and 1024
      and diagnostic_outcome_ids[1] <> diagnostic_outcome_ids[2]
      and primary_outcome_id <> diagnostic_outcome_ids[1]
      and primary_outcome_id <> diagnostic_outcome_ids[2]
      and reproducible = true
      and quality_metrics_eligible = true
    ),
  constraint caee_json_shape_ck
    check (
      jsonb_typeof(persistence_envelope) = 'object'
      and jsonb_typeof(persistence_envelope -> 'source') = 'object'
      and jsonb_typeof(persistence_envelope -> 'evaluation') = 'object'
      and jsonb_typeof(persistence_envelope -> 'evaluation' -> 'horizons') = 'array'
      and jsonb_array_length(persistence_envelope -> 'evaluation' -> 'horizons') = 3
    ),
  constraint caee_envelope_consistency_ck
    check (
      persistence_envelope ->> 'contract_version' = active_evidence_contract_version
      and persistence_envelope ->> 'canonical_identity' = canonical_identity
      and persistence_envelope ->> 'active_evidence_identity' = active_evidence_identity
      and persistence_envelope ->> 'producer_decision_id' = producer_decision_id
      and (persistence_envelope ->> 'decision_timestamp')::timestamptz = decision_timestamp
      and persistence_envelope ->> 'sample_type' = sample_type
      and persistence_envelope ->> 'inactive_readiness_only' = 'false'
      and persistence_envelope #>> '{source,kind}' = source_kind
      and persistence_envelope #>> '{source,receipt_identity}' = source_receipt_identity
      and persistence_envelope #>> '{source,receipt_sha256}' = source_receipt_sha256
      and persistence_envelope #>> '{evaluation,primary_horizon}' = primary_horizon
      and persistence_envelope #>> '{evaluation,primary_outcome_id}' = primary_outcome_id
      and (persistence_envelope #>> '{evaluation,reproducible}')::boolean = reproducible
      and (persistence_envelope #>> '{evaluation,quality_metrics_eligible}')::boolean
        = quality_metrics_eligible
      and persistence_envelope -> 'evaluation' -> 'horizons' @>
        '[{"horizon":"15m"},{"horizon":"30m"},{"horizon":"60m"}]'::jsonb
    )
);

create unique index caee_source_receipt_identity_uidx
  on public.canonical_active_evaluation_evidence (source_receipt_identity);

create index caee_decision_timestamp_idx
  on public.canonical_active_evaluation_evidence (decision_timestamp desc);

create function public.reject_canonical_active_evaluation_evidence_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  raise exception 'canonical active evaluation evidence is immutable: % rejected', tg_op
    using errcode = '55000';
end;
$$;

alter function public.reject_canonical_active_evaluation_evidence_mutation()
  owner to postgres;

revoke all on function public.reject_canonical_active_evaluation_evidence_mutation()
  from public, anon, authenticated, service_role;

create trigger canonical_active_evaluation_evidence_append_only
  before update or delete on public.canonical_active_evaluation_evidence
  for each row
  execute function public.reject_canonical_active_evaluation_evidence_mutation();

alter table public.canonical_active_evaluation_evidence owner to postgres;
alter table public.canonical_active_evaluation_evidence enable row level security;
alter table public.canonical_active_evaluation_evidence force row level security;

revoke all privileges on table public.canonical_active_evaluation_evidence
  from public, anon, authenticated, service_role;

comment on table public.canonical_active_evaluation_evidence is
  'AI-02.10 additive active-evidence v2 storage. The local schema has no RLS policy or application-role grant; a future separately authorized server-owned source binding and least-privilege grant are required before any use.';

comment on column public.canonical_active_evaluation_evidence.persistence_envelope is
  'Immutable canonical_active_evaluation_evidence_v2 envelope. The migration requires complete 15m/30m/60m horizons and inactive_readiness_only=false but does not recompute the semantic digest; a future separately authorized server-only writer must do so immediately before insert and after independent readback.';
