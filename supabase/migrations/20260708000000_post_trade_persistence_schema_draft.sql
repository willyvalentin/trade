-- Draft: post-trade persistence schema.
--
-- NO APPLY YET.
-- This migration file is a code artifact only and requires separate review
-- before it may be applied in any Supabase environment.
--
-- Scope:
-- - post-trade persistence schema draft
-- - metadata and redacted review fields only
-- - no raw artifacts
-- - no production activation
-- - no runtime/API/Trade UI write path
--
-- Do not apply this migration until a separate no-apply review task approves
-- the SQL, RLS approach, rollback plan, and non-production validation plan.

create table if not exists public.execution_confirmation_evidence (
  id uuid primary key default gen_random_uuid(),
  internal_trade_id text not null,
  plan_id text null,
  contract_id text null,
  side text not null,
  ticker text not null,
  evidence_kind text not null,
  evidence_timestamp timestamptz not null,
  redacted_artifact_id text null,
  broker_label text null,
  redaction_status text not null,
  sensitive_data_present boolean not null default false,
  manual_review_status text not null,
  deviation_review_id uuid null,
  source_type text null default 'post_trade_review',
  schema_version text not null,
  gate_version text not null,
  environment_label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint execution_confirmation_evidence_side_check
    check (side in ('BUY', 'SELL')),
  constraint execution_confirmation_evidence_redaction_status_check
    check (redaction_status in ('redacted', 'safe_summary_only')),
  constraint execution_confirmation_evidence_sensitive_false_check
    check (sensitive_data_present = false),
  constraint execution_confirmation_evidence_manual_review_status_check
    check (manual_review_status in ('not_required', 'required', 'approved_for_review_only', 'blocked')),
  constraint execution_confirmation_evidence_environment_label_check
    check (environment_label in ('local_dev', 'staging', 'production'))
);

comment on table public.execution_confirmation_evidence is
  'DRAFT/NO APPLY YET. Redacted broker confirmation metadata only. Requires separate review before apply. No raw artifacts, no runtime writes, no order submission, and no production activation are introduced by this file.';

comment on column public.execution_confirmation_evidence.redacted_artifact_id is
  'Safe internal metadata reference only. Do not store restricted secret, identity, auth, browser, or raw broker material.';

comment on column public.execution_confirmation_evidence.deviation_review_id is
  'Nullable future link placeholder. No foreign key is added in this draft because deviation reviews are created after confirmation evidence.';

create table if not exists public.execution_settlement_reviews (
  id uuid primary key default gen_random_uuid(),
  internal_trade_id text not null,
  plan_id text not null,
  contract_id text not null,
  confirmation_evidence_id uuid null references public.execution_confirmation_evidence(id),
  side text not null,
  ticker text not null,
  quantity numeric not null,
  planned_price numeric not null,
  execution_price numeric not null,
  slippage numeric not null,
  currency text not null,
  gross_amount numeric not null,
  settlement_amount numeric not null,
  commission numeric not null,
  fx_rate numeric null,
  deviation_classification text not null,
  manual_review_status text not null,
  partial_fill_status text null,
  duplicate_confirmation_status text null,
  redaction_status text not null,
  sensitive_data_present boolean not null default false,
  source_type text null default 'post_trade_review',
  schema_version text not null,
  gate_version text not null,
  environment_label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint execution_settlement_reviews_side_check
    check (side in ('BUY', 'SELL')),
  constraint execution_settlement_reviews_quantity_positive_check
    check (quantity > 0),
  constraint execution_settlement_reviews_planned_price_non_negative_check
    check (planned_price >= 0),
  constraint execution_settlement_reviews_execution_price_non_negative_check
    check (execution_price >= 0),
  constraint execution_settlement_reviews_gross_amount_non_negative_check
    check (gross_amount >= 0),
  constraint execution_settlement_reviews_settlement_amount_non_negative_check
    check (settlement_amount >= 0),
  constraint execution_settlement_reviews_commission_non_negative_check
    check (commission >= 0),
  constraint execution_settlement_reviews_fx_rate_positive_check
    check (fx_rate is null or fx_rate > 0),
  constraint execution_settlement_reviews_deviation_classification_check
    check (deviation_classification in (
      'execution_match',
      'minor_execution_deviation',
      'major_execution_deviation',
      'requires_manual_review',
      'blocked_sensitive_or_mismatched_evidence'
    )),
  constraint execution_settlement_reviews_manual_review_status_check
    check (manual_review_status in ('not_required', 'required', 'approved_for_review_only', 'blocked')),
  constraint execution_settlement_reviews_redaction_status_check
    check (redaction_status in ('redacted', 'safe_summary_only')),
  constraint execution_settlement_reviews_sensitive_false_check
    check (sensitive_data_present = false),
  constraint execution_settlement_reviews_environment_label_check
    check (environment_label in ('local_dev', 'staging', 'production'))
);

comment on table public.execution_settlement_reviews is
  'DRAFT/NO APPLY YET. Safe settlement extraction and plan-vs-actual review fields only. Requires separate review before apply. No raw settlement notes, runtime writes, order submission, or production activation are introduced by this file.';

create table if not exists public.execution_cost_breakdowns (
  id uuid primary key default gen_random_uuid(),
  settlement_review_id uuid not null references public.execution_settlement_reviews(id),
  commission numeric not null,
  fx_rate numeric null,
  fx_impact numeric null,
  fee_impact_percent numeric null,
  gross_amount numeric not null,
  settlement_amount numeric not null,
  currency text not null,
  redaction_status text not null,
  sensitive_data_present boolean not null default false,
  schema_version text not null,
  gate_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint execution_cost_breakdowns_commission_non_negative_check
    check (commission >= 0),
  constraint execution_cost_breakdowns_fx_rate_positive_check
    check (fx_rate is null or fx_rate > 0),
  constraint execution_cost_breakdowns_gross_amount_non_negative_check
    check (gross_amount >= 0),
  constraint execution_cost_breakdowns_settlement_amount_non_negative_check
    check (settlement_amount >= 0),
  constraint execution_cost_breakdowns_redaction_status_check
    check (redaction_status in ('redacted', 'safe_summary_only')),
  constraint execution_cost_breakdowns_sensitive_false_check
    check (sensitive_data_present = false)
);

comment on table public.execution_cost_breakdowns is
  'DRAFT/NO APPLY YET. Derived safe cost details only. Requires separate review before apply. No runtime writes or production activation are introduced by this file.';

create table if not exists public.execution_deviation_reviews (
  id uuid primary key default gen_random_uuid(),
  settlement_review_id uuid not null references public.execution_settlement_reviews(id),
  deviation_classification text not null,
  reason_codes text[] not null default array[]::text[],
  requires_manual_review boolean not null default true,
  blocked_reason text null,
  reviewed_by_label text null,
  reviewed_at timestamptz null,
  manual_review_status text not null,
  redaction_status text not null,
  sensitive_data_present boolean not null default false,
  schema_version text not null,
  gate_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint execution_deviation_reviews_deviation_classification_check
    check (deviation_classification in (
      'execution_match',
      'minor_execution_deviation',
      'major_execution_deviation',
      'requires_manual_review',
      'blocked_sensitive_or_mismatched_evidence'
    )),
  constraint execution_deviation_reviews_manual_review_status_check
    check (manual_review_status in ('not_required', 'required', 'approved_for_review_only', 'blocked')),
  constraint execution_deviation_reviews_redaction_status_check
    check (redaction_status in ('redacted', 'safe_summary_only')),
  constraint execution_deviation_reviews_sensitive_false_check
    check (sensitive_data_present = false)
);

comment on table public.execution_deviation_reviews is
  'DRAFT/NO APPLY YET. Deviation classification and manual-review metadata only. Requires separate review before apply. No runtime writes, order behavior, or production activation are introduced by this file.';

create table if not exists public.execution_learning_candidates (
  id uuid primary key default gen_random_uuid(),
  settlement_review_id uuid not null references public.execution_settlement_reviews(id),
  learning_candidate_status text not null,
  outcome_eligible boolean not null default false,
  requires_separate_learning_gate boolean not null default true,
  learning_auto_update_allowed boolean not null default false,
  blocked_reason text null,
  manual_review_status text not null,
  redaction_status text not null,
  sensitive_data_present boolean not null default false,
  schema_version text not null,
  gate_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint execution_learning_candidates_status_check
    check (learning_candidate_status in ('staged_manual_review_only', 'blocked')),
  constraint execution_learning_candidates_outcome_eligible_false_check
    check (outcome_eligible = false),
  constraint execution_learning_candidates_separate_gate_true_check
    check (requires_separate_learning_gate = true),
  constraint execution_learning_candidates_auto_update_false_check
    check (learning_auto_update_allowed = false),
  constraint execution_learning_candidates_manual_review_status_check
    check (manual_review_status in ('not_required', 'required', 'approved_for_review_only', 'blocked')),
  constraint execution_learning_candidates_redaction_status_check
    check (redaction_status in ('redacted', 'safe_summary_only')),
  constraint execution_learning_candidates_sensitive_false_check
    check (sensitive_data_present = false)
);

comment on table public.execution_learning_candidates is
  'DRAFT/NO APPLY YET. Staged learning candidates only. Requires separate review before apply. This table cannot auto-promote, update live learning state, mutate statistics, or activate production persistence.';

create table if not exists public.execution_redacted_artifacts (
  id uuid primary key default gen_random_uuid(),
  artifact_kind text not null,
  redaction_status text not null,
  storage_reference_safe text not null,
  sensitive_data_present boolean not null default false,
  raw_artifact_stored boolean not null default false,
  schema_version text not null,
  gate_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint execution_redacted_artifacts_redaction_status_check
    check (redaction_status in ('redacted', 'safe_summary_only')),
  constraint execution_redacted_artifacts_sensitive_false_check
    check (sensitive_data_present = false),
  constraint execution_redacted_artifacts_raw_artifact_false_check
    check (raw_artifact_stored = false)
);

comment on table public.execution_redacted_artifacts is
  'DRAFT/NO APPLY YET. Optional metadata/reference table only. Requires separate artifact-strategy review before apply. Stores no raw artifact content and does not grant client access.';

comment on column public.execution_redacted_artifacts.storage_reference_safe is
  'Safe internal metadata reference only. Do not store restricted secret, identity, auth, browser, or raw broker material.';

create index if not exists execution_confirmation_evidence_internal_trade_id_idx
  on public.execution_confirmation_evidence (internal_trade_id);

create index if not exists execution_confirmation_evidence_plan_id_idx
  on public.execution_confirmation_evidence (plan_id)
  where plan_id is not null;

create index if not exists execution_confirmation_evidence_contract_id_idx
  on public.execution_confirmation_evidence (contract_id)
  where contract_id is not null;

create index if not exists execution_confirmation_evidence_ticker_idx
  on public.execution_confirmation_evidence (ticker);

create index if not exists execution_confirmation_evidence_side_idx
  on public.execution_confirmation_evidence (side);

create index if not exists execution_confirmation_evidence_created_at_idx
  on public.execution_confirmation_evidence (created_at desc);

create index if not exists execution_confirmation_evidence_manual_review_status_idx
  on public.execution_confirmation_evidence (manual_review_status);

create index if not exists execution_settlement_reviews_internal_trade_id_idx
  on public.execution_settlement_reviews (internal_trade_id);

create index if not exists execution_settlement_reviews_plan_id_idx
  on public.execution_settlement_reviews (plan_id);

create index if not exists execution_settlement_reviews_contract_id_idx
  on public.execution_settlement_reviews (contract_id);

create index if not exists execution_settlement_reviews_confirmation_evidence_id_idx
  on public.execution_settlement_reviews (confirmation_evidence_id)
  where confirmation_evidence_id is not null;

create index if not exists execution_settlement_reviews_ticker_idx
  on public.execution_settlement_reviews (ticker);

create index if not exists execution_settlement_reviews_side_idx
  on public.execution_settlement_reviews (side);

create index if not exists execution_settlement_reviews_created_at_idx
  on public.execution_settlement_reviews (created_at desc);

create index if not exists execution_settlement_reviews_manual_review_status_idx
  on public.execution_settlement_reviews (manual_review_status);

create index if not exists execution_settlement_reviews_deviation_classification_idx
  on public.execution_settlement_reviews (deviation_classification);

create index if not exists execution_cost_breakdowns_settlement_review_id_idx
  on public.execution_cost_breakdowns (settlement_review_id);

create index if not exists execution_cost_breakdowns_created_at_idx
  on public.execution_cost_breakdowns (created_at desc);

create index if not exists execution_deviation_reviews_settlement_review_id_idx
  on public.execution_deviation_reviews (settlement_review_id);

create index if not exists execution_deviation_reviews_deviation_classification_idx
  on public.execution_deviation_reviews (deviation_classification);

create index if not exists execution_deviation_reviews_manual_review_status_idx
  on public.execution_deviation_reviews (manual_review_status);

create index if not exists execution_deviation_reviews_created_at_idx
  on public.execution_deviation_reviews (created_at desc);

create index if not exists execution_learning_candidates_settlement_review_id_idx
  on public.execution_learning_candidates (settlement_review_id);

create index if not exists execution_learning_candidates_status_idx
  on public.execution_learning_candidates (learning_candidate_status);

create index if not exists execution_learning_candidates_created_at_idx
  on public.execution_learning_candidates (created_at desc);

create index if not exists execution_redacted_artifacts_kind_idx
  on public.execution_redacted_artifacts (artifact_kind);

create index if not exists execution_redacted_artifacts_created_at_idx
  on public.execution_redacted_artifacts (created_at desc);

alter table public.execution_confirmation_evidence
  enable row level security;

alter table public.execution_settlement_reviews
  enable row level security;

alter table public.execution_cost_breakdowns
  enable row level security;

alter table public.execution_deviation_reviews
  enable row level security;

alter table public.execution_learning_candidates
  enable row level security;

alter table public.execution_redacted_artifacts
  enable row level security;

-- Draft RLS approach:
-- - RLS is enabled for every table.
-- - No permissive policies are created in this draft.
-- - The exact app-auth/server-write model is not finalized.
-- - Future policies must preserve scoped reads, gated server-context creation,
--   manual-review/admin changes, rollback/admin removal, no anon access, no
--   broad client writes, and no raw artifact access.
-- - This draft must not be applied until those policies are reviewed and
--   tested in a non-production Supabase environment.
--
-- Rollback notes:
-- - Test rollback in non-production before any production step.
-- - Drop dependent tables before parent tables.
-- - Reverse order:
--   1. public.execution_redacted_artifacts
--   2. public.execution_learning_candidates
--   3. public.execution_deviation_reviews
--   4. public.execution_cost_breakdowns
--   5. public.execution_settlement_reviews
--   6. public.execution_confirmation_evidence
-- - Rollback must not expose raw artifacts or sensitive broker/person/auth
--   material.
