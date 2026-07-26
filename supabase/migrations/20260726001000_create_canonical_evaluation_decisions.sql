-- Action 664D: additive canonical evaluation storage.
--
-- This migration is local-only in Action 664D. It must not be applied to a
-- linked or production database without a separate reviewed action.
--
-- Migration version 20260726001000 was verified unused in origin/main and the
-- two local tracks before this file was created. Track 1 separately reserves
-- the immediately preceding version 20260726000000 for its own local worktree.

create table public.canonical_evaluation_decisions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  storage_contract_version text not null,
  envelope_contract_version text not null,
  lineage_contract_version text not null,
  canonical_identity text not null,
  semantic_payload_sha256 text not null,
  idempotency_key text not null,

  producer_decision_id text not null,
  source_namespace text not null,
  decision_timestamp timestamptz not null,
  decision_kind text not null,
  sample_type text not null,

  candidate_id text null,
  scan_run_id text null,
  scan_run_fingerprint text null,
  batch_id text null,
  batch_fingerprint text null,
  snapshot_id text null,
  snapshot_fingerprint text null,
  recommendation_id text null,

  numeric_confidence double precision null,
  confidence_label text null,

  engine_version text null,
  scoring_version text null,
  ranking_version text null,
  setup_taxonomy_version text null,
  confidence_contract_version text null,
  evaluator_version text null,
  provider_contract_version text null,
  git_commit text null,
  build_identity text null,

  regime_at_decision text null,
  sector_at_decision text null,
  provider text null,
  provider_source_timestamp timestamptz null,
  freshness text null,
  candle_interval text null,
  expected_candle_count integer null,
  observed_candle_count integer null,
  coverage_reason_codes text[] not null default array[]::text[],

  evaluator_input_identity text null,
  primary_horizon text null,
  primary_outcome_id text null,
  diagnostic_outcome_ids text[] not null default array[]::text[],
  reproducible boolean not null,
  quality_metrics_eligible boolean not null,

  lineage_json jsonb not null,
  versions_json jsonb not null,
  decision_context_json jsonb not null,
  provider_context_json jsonb not null,
  evaluation_json jsonb not null,
  replay_metadata_json jsonb null,
  diagnostic_horizons_json jsonb not null,
  persistence_envelope jsonb not null,

  constraint ce_decisions_storage_version_ck
    check (storage_contract_version = 'canonical_evaluation_storage_payload_v1'),
  constraint ce_decisions_envelope_version_ck
    check (envelope_contract_version = 'canonical_evaluation_persistence_v1'),
  constraint ce_decisions_lineage_version_ck
    check (lineage_contract_version = 'canonical_evaluation_lineage_v1'),
  constraint ce_decisions_identity_ck
    check (
      length(canonical_identity) between 1 and 1024
      and canonical_identity ~ '^rec_decision:v1:[^:]+:[^:]+:[0-9]+$'
      and idempotency_key = 'canonical_evaluation:v1:' || canonical_identity
    ),
  constraint ce_decisions_identity_unique
    unique (canonical_identity),
  constraint ce_decisions_semantic_digest_ck
    check (semantic_payload_sha256 ~ '^[0-9a-f]{64}$'),
  constraint ce_decisions_required_text_ck
    check (
      length(btrim(producer_decision_id)) between 1 and 512
      and length(btrim(source_namespace)) between 1 and 256
    ),
  constraint ce_decisions_decision_kind_ck
    check (
      decision_kind in (
        'recommendation',
        'rejection',
        'no_trade',
        'historical_synthetic'
      )
    ),
  constraint ce_decisions_sample_type_ck
    check (
      sample_type in (
        'visible',
        'research_only',
        'shadow',
        'historical_synthetic',
        'rejected_candidate',
        'no_trade'
      )
    ),
  constraint ce_decisions_kind_sample_ck
    check (
      (sample_type in ('visible', 'research_only', 'shadow') and decision_kind = 'recommendation')
      or (sample_type = 'historical_synthetic' and decision_kind = 'historical_synthetic')
      or (sample_type = 'rejected_candidate' and decision_kind = 'rejection')
      or (sample_type = 'no_trade' and decision_kind = 'no_trade')
    ),
  constraint ce_decisions_confidence_ck
    check (
      numeric_confidence is null
      or (numeric_confidence >= 0 and numeric_confidence <= 1)
    ),
  constraint ce_decisions_confidence_label_ck
    check (
      confidence_label is null
      or confidence_label in ('low', 'medium', 'high')
    ),
  constraint ce_decisions_git_commit_ck
    check (git_commit is null or git_commit ~ '^[0-9a-f]{40}$'),
  constraint ce_decisions_coverage_ck
    check (
      (expected_candle_count is null or expected_candle_count >= 0)
      and (observed_candle_count is null or observed_candle_count >= 0)
    ),
  constraint ce_decisions_primary_horizon_ck
    check (
      primary_horizon is null
      or primary_horizon in ('15m', '30m', '60m')
    ),
  constraint ce_decisions_quality_versions_ck
    check (
      not quality_metrics_eligible
      or (
        coalesce(length(btrim(engine_version)) > 0, false)
        and coalesce(length(btrim(scoring_version)) > 0, false)
        and coalesce(length(btrim(ranking_version)) > 0, false)
        and coalesce(length(btrim(setup_taxonomy_version)) > 0, false)
        and coalesce(length(btrim(confidence_contract_version)) > 0, false)
        and coalesce(length(btrim(evaluator_version)) > 0, false)
        and coalesce(length(btrim(provider_contract_version)) > 0, false)
        and coalesce(git_commit ~ '^[0-9a-f]{40}$', false)
        and coalesce(length(btrim(build_identity)) > 0, false)
      )
    ),
  constraint ce_decisions_lineage_ck
    check (
      (
        sample_type in ('visible', 'research_only', 'shadow')
        and candidate_id is not null
        and scan_run_id is not null
        and batch_id is not null
      )
      or (
        sample_type = 'historical_synthetic'
        and candidate_id is not null
        and replay_metadata_json is not null
      )
      or (
        sample_type = 'rejected_candidate'
        and candidate_id is not null
        and scan_run_id is not null
        and batch_id is not null
        and snapshot_id is null
        and recommendation_id is null
        and cardinality(diagnostic_outcome_ids) = 0
      )
      or (
        sample_type = 'no_trade'
        and scan_run_id is not null
        and batch_id is not null
        and candidate_id is null
        and snapshot_id is null
        and recommendation_id is null
        and primary_outcome_id is null
        and cardinality(diagnostic_outcome_ids) = 0
      )
    ),
  constraint ce_decisions_snapshot_lineage_ck
    check (
      source_namespace <> 'recommendation_snapshot'
      or (
        snapshot_id is not null
        and recommendation_id = producer_decision_id
      )
    ),
  constraint ce_decisions_json_shape_ck
    check (
      jsonb_typeof(lineage_json) = 'object'
      and jsonb_typeof(versions_json) = 'object'
      and jsonb_typeof(decision_context_json) = 'object'
      and jsonb_typeof(provider_context_json) = 'object'
      and jsonb_typeof(evaluation_json) = 'object'
      and jsonb_typeof(diagnostic_horizons_json) = 'array'
      and jsonb_typeof(persistence_envelope) = 'object'
      and (replay_metadata_json is null or jsonb_typeof(replay_metadata_json) = 'object')
    ),
  constraint ce_decisions_envelope_consistency_ck
    check (
      persistence_envelope ->> 'contract_version' = envelope_contract_version
      and persistence_envelope ->> 'canonical_identity' = canonical_identity
      and persistence_envelope ->> 'producer_decision_id' = producer_decision_id
      and persistence_envelope ->> 'source_namespace' = source_namespace
      and (persistence_envelope ->> 'decision_timestamp')::timestamptz = decision_timestamp
      and persistence_envelope ->> 'decision_kind' = decision_kind
      and persistence_envelope ->> 'sample_type' = sample_type
      and (persistence_envelope ->> 'inactive_readiness_only')::boolean = true
      and persistence_envelope -> 'lineage' = lineage_json
      and persistence_envelope -> 'versions' = versions_json
      and persistence_envelope -> 'decision_context' = decision_context_json
      and persistence_envelope -> 'provider_context' = provider_context_json
      and persistence_envelope -> 'evaluation' = evaluation_json
      and diagnostic_horizons_json = evaluation_json -> 'horizons'
      and nullif(evaluation_json -> 'replay', 'null'::jsonb)
        is not distinct from replay_metadata_json
      and (evaluation_json ->> 'reproducible')::boolean = reproducible
      and (evaluation_json ->> 'quality_metrics_eligible')::boolean
        = quality_metrics_eligible
      and evaluation_json ->> 'evaluator_input_identity'
        is not distinct from evaluator_input_identity
      and evaluation_json ->> 'primary_outcome_id'
        is not distinct from primary_outcome_id
      and versions_json ->> 'engine_version' is not distinct from engine_version
      and versions_json ->> 'scoring_version' is not distinct from scoring_version
      and versions_json ->> 'ranking_version' is not distinct from ranking_version
      and versions_json ->> 'setup_taxonomy_version'
        is not distinct from setup_taxonomy_version
      and versions_json ->> 'confidence_contract_version'
        is not distinct from confidence_contract_version
      and versions_json ->> 'evaluator_version'
        is not distinct from evaluator_version
      and versions_json ->> 'provider_contract_version'
        is not distinct from provider_contract_version
      and versions_json ->> 'git_commit' is not distinct from git_commit
      and versions_json ->> 'build_identity' is not distinct from build_identity
      and (persistence_envelope #>> '{confidence,numeric_confidence}')::double precision
        is not distinct from numeric_confidence
      and persistence_envelope #>> '{confidence,confidence_label}'
        is not distinct from confidence_label
    )
);

create unique index ce_decisions_evaluator_input_uidx
  on public.canonical_evaluation_decisions (evaluator_input_identity)
  where evaluator_input_identity is not null and quality_metrics_eligible;

create index ce_decisions_decision_timestamp_idx
  on public.canonical_evaluation_decisions (decision_timestamp desc);

create index ce_decisions_sample_timestamp_idx
  on public.canonical_evaluation_decisions (sample_type, decision_timestamp desc);

create index ce_decisions_candidate_idx
  on public.canonical_evaluation_decisions (candidate_id)
  where candidate_id is not null;

create index ce_decisions_scan_run_idx
  on public.canonical_evaluation_decisions (scan_run_id)
  where scan_run_id is not null;

create index ce_decisions_batch_idx
  on public.canonical_evaluation_decisions (batch_id)
  where batch_id is not null;

create index ce_decisions_snapshot_idx
  on public.canonical_evaluation_decisions (snapshot_id)
  where snapshot_id is not null;

create index ce_decisions_recommendation_idx
  on public.canonical_evaluation_decisions (recommendation_id)
  where recommendation_id is not null;

create index ce_decisions_lineage_gin_idx
  on public.canonical_evaluation_decisions using gin (lineage_json);

create index ce_decisions_horizons_gin_idx
  on public.canonical_evaluation_decisions using gin (diagnostic_horizons_json);

create function public.reject_canonical_evaluation_decision_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  raise exception 'canonical evaluation decisions are immutable: % rejected', tg_op
    using errcode = '55000';
end;
$$;

alter function public.reject_canonical_evaluation_decision_mutation()
  owner to postgres;

revoke all on function public.reject_canonical_evaluation_decision_mutation()
  from public, anon, authenticated, service_role;

create trigger canonical_evaluation_decisions_append_only
  before update or delete on public.canonical_evaluation_decisions
  for each row
  execute function public.reject_canonical_evaluation_decision_mutation();

alter table public.canonical_evaluation_decisions owner to postgres;
alter table public.canonical_evaluation_decisions enable row level security;

revoke all privileges on table public.canonical_evaluation_decisions
  from public, anon, authenticated, service_role;

grant select, insert on table public.canonical_evaluation_decisions
  to service_role;

comment on table public.canonical_evaluation_decisions is
  'Action 664D additive server-owned append-only recommendation-evaluation storage. RLS has zero policies. Diagnostic horizons remain inside the immutable canonical_evaluation_persistence_v1 envelope and do not multiply the canonical decision row.';

comment on column public.canonical_evaluation_decisions.semantic_payload_sha256 is
  'Lowercase SHA-256 of deterministic canonical envelope JSON. PostgreSQL validates digest format and normalized/envelope parity but intentionally does not canonicalize JSON or recompute this digest. The server application must recompute it immediately before insert and after every readback. Equal canonical identity plus equal recomputed digest is an idempotent no-effect; a different or unreproducible digest is a semantic conflict and must never overwrite.';

comment on column public.canonical_evaluation_decisions.persistence_envelope is
  'Lossless immutable canonical_evaluation_persistence_v1 envelope. Normalized columns are query projections and must remain consistent with this source envelope.';

comment on column public.canonical_evaluation_decisions.diagnostic_horizons_json is
  'All diagnostic 15m/30m/60m horizon rows for the canonical decision. These never create additional canonical recommendation rows.';
