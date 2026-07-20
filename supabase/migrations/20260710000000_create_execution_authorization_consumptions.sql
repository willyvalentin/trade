create table if not exists public.execution_authorization_consumptions (
  id uuid primary key default gen_random_uuid(),
  authorization_artifact_id text not null,
  authorization_artifact_version text not null,
  authorization_fingerprint text not null,
  authorization_type text not null,
  source_action_identity text not null,
  execution_attempt_id text not null,
  execution_plan_id text not null,
  consumption_operation_id text not null,
  execution_scope text not null,
  target_project_id text not null default 'pdvzyuhykomwfqyyztru',
  rejected_production_project_id text not null default 'ekdyopdrrkphlrsilyoo',
  execution_function_name text not null,
  execution_function_contract_version text not null,
  execution_function_implementation_decision text not null,
  execution_function_review_decision text not null,
  final_gate_identity text not null,
  final_gate_implementation_decision text not null,
  final_gate_review_decision text not null,
  expected_operation_count integer not null default 2,
  expected_row_count integer not null default 2,
  first_target_table text not null default 'execution_records',
  second_target_table text not null default 'execution_record_audit_events',
  audit_dependency_identity text not null default 'execution_record_audit_events.execution_record_id_from_execution_records.id',
  mock_only boolean not null default true,
  one_shot boolean not null default true,
  retry_allowed boolean not null default false,
  authorization_state text not null default 'unused',
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  consumed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  execution_record_id uuid null references public.execution_records(id) on delete restrict,
  execution_audit_event_id uuid null references public.execution_record_audit_events(id) on delete restrict,
  affected_authorization_row_count integer null,
  persistence_operation_identity text null,
  result_classification text null,
  constraint execution_authorization_consumptions_identity_non_empty_check
    check (
      length(btrim(authorization_artifact_id)) > 0
      and length(btrim(authorization_artifact_version)) > 0
      and length(btrim(authorization_fingerprint)) > 0
      and length(btrim(authorization_type)) > 0
      and length(btrim(source_action_identity)) > 0
      and length(btrim(execution_attempt_id)) > 0
      and length(btrim(execution_plan_id)) > 0
      and length(btrim(consumption_operation_id)) > 0
      and length(btrim(execution_scope)) > 0
      and length(btrim(execution_function_name)) > 0
      and length(btrim(execution_function_contract_version)) > 0
      and length(btrim(execution_function_implementation_decision)) > 0
      and length(btrim(execution_function_review_decision)) > 0
      and length(btrim(final_gate_identity)) > 0
      and length(btrim(final_gate_implementation_decision)) > 0
      and length(btrim(final_gate_review_decision)) > 0
    ),
  constraint execution_authorization_consumptions_target_project_check
    check (
      target_project_id = 'pdvzyuhykomwfqyyztru'
      and target_project_id <> 'ekdyopdrrkphlrsilyoo'
    ),
  constraint execution_authorization_consumptions_rejected_production_check
    check (rejected_production_project_id = 'ekdyopdrrkphlrsilyoo'),
  constraint execution_authorization_consumptions_state_check
    check (authorization_state in ('unused', 'consumed', 'invalid', 'expired')),
  constraint execution_authorization_consumptions_execution_scope_check
    check (execution_scope = 'staging_mock_post_trade_execution'),
  constraint execution_authorization_consumptions_contract_counts_check
    check (expected_operation_count = 2 and expected_row_count = 2),
  constraint execution_authorization_consumptions_ordered_tables_check
    check (
      first_target_table = 'execution_records'
      and second_target_table = 'execution_record_audit_events'
      and first_target_table <> second_target_table
    ),
  constraint execution_authorization_consumptions_audit_dependency_check
    check (
      audit_dependency_identity = 'execution_record_audit_events.execution_record_id_from_execution_records.id'
    ),
  constraint execution_authorization_consumptions_one_shot_check
    check (mock_only = true and one_shot = true and retry_allowed = false),
  constraint execution_authorization_consumptions_validity_window_check
    check (
      expires_at > issued_at
      and expires_at <= issued_at + interval '15 minutes'
    ),
  constraint execution_authorization_consumptions_unused_evidence_check
    check (
      authorization_state <> 'unused'
      or (
        consumed_at is null
        and execution_record_id is null
        and execution_audit_event_id is null
        and affected_authorization_row_count is null
        and persistence_operation_identity is null
        and result_classification is null
      )
    ),
  constraint execution_authorization_consumptions_consumed_evidence_check
    check (
      authorization_state <> 'consumed'
      or (
        consumed_at is not null
        and consumed_at >= issued_at
        and consumed_at <= expires_at
        and execution_record_id is not null
        and execution_audit_event_id is not null
        and affected_authorization_row_count = 1
        and persistence_operation_identity is not null
        and result_classification = 'transitioned_unused_to_consumed'
      )
    ),
  constraint execution_authorization_consumptions_inactive_no_evidence_check
    check (
      authorization_state not in ('invalid', 'expired')
      or (
        consumed_at is null
        and execution_record_id is null
        and execution_audit_event_id is null
        and affected_authorization_row_count is null
        and persistence_operation_identity is null
        and result_classification is null
      )
    )
);

create unique index if not exists execution_authorization_consumptions_artifact_id_uidx
  on public.execution_authorization_consumptions (target_project_id, authorization_artifact_id);

create unique index if not exists execution_authorization_consumptions_fingerprint_uidx
  on public.execution_authorization_consumptions (target_project_id, authorization_fingerprint);

create unique index if not exists execution_authorization_consumptions_attempt_id_uidx
  on public.execution_authorization_consumptions (target_project_id, execution_attempt_id);

create unique index if not exists execution_authorization_consumptions_plan_id_uidx
  on public.execution_authorization_consumptions (target_project_id, execution_plan_id);

create unique index if not exists execution_authorization_consumptions_operation_id_uidx
  on public.execution_authorization_consumptions (target_project_id, consumption_operation_id);

create unique index if not exists execution_authorization_consumptions_artifact_plan_uidx
  on public.execution_authorization_consumptions (
    target_project_id,
    authorization_artifact_id,
    execution_plan_id
  );

create index if not exists execution_authorization_consumptions_read_back_idx
  on public.execution_authorization_consumptions (
    target_project_id,
    authorization_artifact_id,
    authorization_fingerprint,
    execution_attempt_id,
    execution_plan_id,
    consumption_operation_id
  );

create index if not exists execution_authorization_consumptions_state_expiry_idx
  on public.execution_authorization_consumptions (authorization_state, expires_at);

alter table public.execution_authorization_consumptions
  enable row level security;

revoke all privileges on table public.execution_authorization_consumptions
  from anon, authenticated;

comment on table public.execution_authorization_consumptions is
  'Staging-only durable one-shot execution authorization consumption table. This migration creates schema only; it creates no authorization rows, execution rows, audit rows, database function, runtime writer, client path, or production deployment.';

comment on column public.execution_authorization_consumptions.target_project_id is
  'Fixed to approved staging project pdvzyuhykomwfqyyztru. Production project ekdyopdrrkphlrsilyoo is rejected as an execution target.';

comment on column public.execution_authorization_consumptions.authorization_state is
  'Durable state is limited to unused, consumed, invalid, or expired. Transition history enforcement belongs to the future reviewed atomic database-function boundary.';

comment on column public.execution_authorization_consumptions.execution_record_id is
  'Nullable until consumed. Future atomic function must create and attach exactly one public.execution_records row before marking the authorization consumed.';

comment on column public.execution_authorization_consumptions.execution_audit_event_id is
  'Nullable until consumed. Future atomic function must create and attach one dependent public.execution_record_audit_events row and verify it references the stored execution record.';

comment on column public.execution_authorization_consumptions.result_classification is
  'Authoritative consumed classification must be transitioned_unused_to_consumed. No generic success or ambiguous result is persisted as consumed.';

-- RLS is enabled with no client-facing policies.
-- The future mutation path must be a separately reviewed staging-only atomic
-- database function. Do not add direct client, production, retry, or runtime
-- writer behavior in this migration.
