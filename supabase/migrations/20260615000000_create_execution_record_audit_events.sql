create table if not exists public.execution_record_audit_events (
  id uuid primary key default gen_random_uuid(),
  execution_record_id uuid not null references public.execution_records(id) on delete restrict,
  event_type text not null,
  event_source text not null,
  event_status text not null,
  event_payload jsonb not null default '{}'::jsonb,
  evidence_payload jsonb not null default '{}'::jsonb,
  actor_type text null,
  actor_id text null,
  source_system text not null,
  source_fingerprint text null,
  idempotency_key text not null,
  duplicate_prevention_key text null,
  created_at timestamptz not null default now(),
  occurred_at timestamptz null,
  schema_version text not null default '1.0',
  writer_version text null,
  request_id text null,
  trace_id text null,
  metadata jsonb not null default '{}'::jsonb,
  constraint execution_record_audit_events_event_type_non_empty_check
    check (length(btrim(event_type)) > 0),
  constraint execution_record_audit_events_event_source_non_empty_check
    check (length(btrim(event_source)) > 0),
  constraint execution_record_audit_events_event_status_check
    check (event_status in ('attempted', 'succeeded', 'failed', 'blocked', 'duplicate', 'unknown')),
  constraint execution_record_audit_events_source_system_non_empty_check
    check (length(btrim(source_system)) > 0),
  constraint execution_record_audit_events_idempotency_key_non_empty_check
    check (length(btrim(idempotency_key)) > 0),
  constraint execution_record_audit_events_duplicate_prevention_key_non_empty_check
    check (duplicate_prevention_key is null or length(btrim(duplicate_prevention_key)) > 0),
  constraint execution_record_audit_events_schema_version_non_empty_check
    check (length(btrim(schema_version)) > 0)
);

create unique index if not exists execution_record_audit_events_idempotency_key_uidx
  on public.execution_record_audit_events (idempotency_key);

create unique index if not exists execution_record_audit_events_duplicate_prevention_key_uidx
  on public.execution_record_audit_events (duplicate_prevention_key)
  where duplicate_prevention_key is not null;

create index if not exists execution_record_audit_events_execution_record_id_idx
  on public.execution_record_audit_events (execution_record_id);

create index if not exists execution_record_audit_events_event_type_idx
  on public.execution_record_audit_events (event_type);

create index if not exists execution_record_audit_events_event_status_idx
  on public.execution_record_audit_events (event_status);

create index if not exists execution_record_audit_events_created_at_idx
  on public.execution_record_audit_events (created_at desc);

create index if not exists execution_record_audit_events_source_fingerprint_idx
  on public.execution_record_audit_events (source_fingerprint)
  where source_fingerprint is not null;

comment on table public.execution_record_audit_events is
  'Append-only execution-record audit events table. Migration file only; no app writes, audit writer, route, trade mutations, broker actions, or Avanza automation are implemented by this migration.';

comment on column public.execution_record_audit_events.execution_record_id is
  'Required reference to public.execution_records(id). Remote migration application and generated audit types remain separate proof requirements.';

comment on column public.execution_record_audit_events.event_payload is
  'Sanitized event details. Do not store broker credentials, cookies, raw broker pages, full browser sessions, 2FA material, or unrelated PII.';

comment on column public.execution_record_audit_events.evidence_payload is
  'Minimized evidence/provenance summary. Do not store secrets or raw broker/browser artifacts.';

comment on column public.execution_record_audit_events.idempotency_key is
  'Stable retry key for the intended audit event write. This migration creates only the local schema object and does not implement writer conflict behavior.';

comment on column public.execution_record_audit_events.duplicate_prevention_key is
  'Optional semantic duplicate-prevention key. Non-null values are unique; null is allowed until a future writer proves every event can provide a stable duplicate-prevention key.';

comment on column public.execution_record_audit_events.metadata is
  'Non-authoritative diagnostic metadata. Do not use as the source of truth for downstream stats, trade reconciliation, rollback, broker/order behavior, Avanza behavior, or automatic mode.';

-- RLS is intentionally not enabled in this migration because the audit event
-- ownership, route/auth, service-role, and policy model is not proven yet.
-- Before any writer or route uses this table, prove that anon/client writes are
-- blocked and that server-only/service-role writes are properly isolated.
-- Do not create permissive client insert/update policies for this table.
