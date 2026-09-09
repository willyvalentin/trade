-- Action 666JD: C-01 source-only canonical execution-intent audit foundation.
--
-- This migration is intentionally source-only. It must not be applied to a
-- shared environment from this action. It creates no writer, RPC, route,
-- credential, broker transport, deployment, or runtime binding.
--
-- The relation is distinct from execution_records: it records the immutable
-- pre-broker intent issuance boundary. A future reviewed server-owned writer
-- must recompute the digest before insert and prove the required private
-- transport, owner authentication, rollback and independent readback gates.

create table public.canonical_execution_intent_audits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default pg_catalog.now(),

  owner_user_id uuid not null
    references auth.users(id) on delete restrict,
  canonical_intent_identity text not null,
  semantic_payload_sha256 text not null,
  idempotency_key text not null,

  authority_contract_version text not null,
  audit_event_type text not null,
  audit_status text not null,
  intent_id text not null,
  intent_created_at timestamptz not null,
  execution_mode text not null,
  action text not null,
  trigger_type text not null,
  trigger_priority integer not null,
  broker_hint text not null,
  intent_source text not null,

  recommendation_id text null,
  position_id text null,
  ticker text not null,
  market text not null,
  quantity numeric not null,
  order_type text not null,
  limit_price numeric null,
  stop_loss numeric null,
  target_price numeric null,
  expires_at timestamptz null,
  payload_id text null,
  payload_fingerprint text null,
  safety_warnings text[] not null default array[]::text[],

  intent_payload jsonb not null,
  audit_envelope jsonb not null,

  constraint canonical_execution_intent_audits_identity_unique
    unique (canonical_intent_identity),
  constraint canonical_execution_intent_audits_owner_intent_unique
    unique (owner_user_id, intent_id),
  constraint canonical_execution_intent_audits_idempotency_unique
    unique (idempotency_key),
  constraint canonical_execution_intent_audits_contract_version_check
    check (
      authority_contract_version = 'canonical_execution_intent_audit_v1'
    ),
  constraint canonical_execution_intent_audits_event_type_check
    check (audit_event_type = 'intent_issued'),
  constraint canonical_execution_intent_audits_status_check
    check (audit_status = 'prepared'),
  constraint canonical_execution_intent_audits_identity_check
    check (
      canonical_intent_identity =
        'execution_intent:v1:' || semantic_payload_sha256
      and idempotency_key =
        'execution_intent_audit:v1:' || canonical_intent_identity
    ),
  constraint canonical_execution_intent_audits_digest_check
    check (semantic_payload_sha256 ~ '^[0-9a-f]{64}$'),
  constraint canonical_execution_intent_audits_intent_id_check
    check (length(pg_catalog.btrim(intent_id)) between 1 and 256),
  constraint canonical_execution_intent_audits_mode_check
    check (execution_mode = 'semi_automatic'),
  constraint canonical_execution_intent_audits_action_check
    check (action in ('buy', 'sell')),
  constraint canonical_execution_intent_audits_trigger_type_check
    check (
      trigger_type in (
        'exit_stop_loss_reached',
        'exit_risk_required',
        'exit_end_of_day',
        'exit_target_reached',
        'manual_exit_requested',
        'entry_recommendation_ready',
        'manual_entry_requested'
      )
    ),
  constraint canonical_execution_intent_audits_trigger_priority_check
    check (trigger_priority between 1 and 7),
  constraint canonical_execution_intent_audits_trigger_action_check
    check (
      (trigger_type in (
        'exit_stop_loss_reached',
        'exit_risk_required',
        'exit_end_of_day',
        'exit_target_reached',
        'manual_exit_requested'
      ) and action = 'sell')
      or
      (trigger_type in (
        'entry_recommendation_ready',
        'manual_entry_requested'
      ) and action = 'buy')
    ),
  constraint canonical_execution_intent_audits_broker_check
    check (broker_hint = 'AVANZA'),
  constraint canonical_execution_intent_audits_source_check
    check (
      intent_source in (
        'recommendation',
        'live_day_trade_position',
        'manual',
        'risk_control'
      )
    ),
  constraint canonical_execution_intent_audits_ticker_check
    check (length(pg_catalog.btrim(ticker)) between 1 and 32),
  constraint canonical_execution_intent_audits_quantity_check
    check (quantity > 0),
  constraint canonical_execution_intent_audits_order_type_check
    check (
      order_type in ('market', 'limit', 'market_reference', 'limit_reference')
    ),
  constraint canonical_execution_intent_audits_limit_price_check
    check (
      (order_type in ('limit', 'limit_reference') and limit_price > 0)
      or
      (order_type in ('market', 'market_reference') and limit_price is null)
    ),
  constraint canonical_execution_intent_audits_optional_price_check
    check (
      (stop_loss is null or stop_loss > 0)
      and (target_price is null or target_price > 0)
    ),
  constraint canonical_execution_intent_audits_lineage_check
    check (
      (trigger_type in ('entry_recommendation_ready', 'manual_entry_requested')
        and recommendation_id is not null)
      or
      (trigger_type in (
        'exit_stop_loss_reached',
        'exit_risk_required',
        'exit_end_of_day',
        'exit_target_reached',
        'manual_exit_requested'
      ) and position_id is not null)
    ),
  constraint canonical_execution_intent_audits_json_shape_check
    check (
      jsonb_typeof(intent_payload) = 'object'
      and jsonb_typeof(audit_envelope) = 'object'
    ),
  constraint canonical_execution_intent_audits_payload_scalar_consistency_check
    check (
      intent_payload @> jsonb_build_object(
        'contract_version', authority_contract_version,
        'owner_user_id', owner_user_id::text,
        'intent', jsonb_build_object(
          'intent_version', '1.0',
          'intent_id', intent_id,
          'mode', execution_mode,
          'action', action,
          'trigger_type', trigger_type,
          'trigger_priority', trigger_priority,
          'broker_hint', broker_hint,
          'source', intent_source,
          'trading_package', jsonb_build_object(
            'package_version', '1.0',
            'recommendation_id', recommendation_id,
            'live_position_id', position_id,
            'ticker', ticker,
            'market', market,
            'quantity', quantity,
            'order_type', order_type,
            'limit_price', limit_price,
            'stop_loss', stop_loss,
            'target_price', target_price,
            'payload_id', payload_id,
            'payload_fingerprint', payload_fingerprint
          )
        )
      )
      and intent_payload #> '{intent,safety_warnings}' = to_jsonb(safety_warnings)
      and intent_payload #>> '{intent,created_at}' is not null
      and (intent_payload #>> '{intent,created_at}')::timestamptz
        = intent_created_at
      and (
        (expires_at is null
          and intent_payload #>> '{intent,trading_package,expires_at}' is null)
        or
        (expires_at is not null
          and intent_payload #>> '{intent,trading_package,expires_at}' is not null
          and (intent_payload #>> '{intent,trading_package,expires_at}')::timestamptz
            = expires_at)
      )
    ),
  constraint canonical_execution_intent_audits_envelope_consistency_check
    check (
      audit_envelope ->> 'contract_version' = authority_contract_version
      and audit_envelope ->> 'canonical_intent_identity'
        = canonical_intent_identity
      and audit_envelope ->> 'semantic_payload_sha256'
        = semantic_payload_sha256
      and audit_envelope ->> 'idempotency_key' = idempotency_key
      and audit_envelope ->> 'owner_user_id' = owner_user_id::text
      and audit_envelope ->> 'intent_id' = intent_id
      and audit_envelope ->> 'audit_event_type' = audit_event_type
      and audit_envelope ->> 'audit_status' = audit_status
    )
);

create index canonical_execution_intent_audits_owner_created_at_idx
  on public.canonical_execution_intent_audits (owner_user_id, created_at desc);

create index canonical_execution_intent_audits_ticker_created_at_idx
  on public.canonical_execution_intent_audits (ticker, created_at desc);

create function public.action_666jd_reject_canonical_execution_intent_audit_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  raise exception 'canonical execution intent audits are immutable: % rejected', tg_op
    using errcode = '55000';
end;
$$;

alter function public.action_666jd_reject_canonical_execution_intent_audit_mutation()
  owner to postgres;

revoke all on function public.action_666jd_reject_canonical_execution_intent_audit_mutation()
  from public, anon, authenticated, service_role;

create trigger canonical_execution_intent_audits_append_only
  before update or delete on public.canonical_execution_intent_audits
  for each row
  execute function public.action_666jd_reject_canonical_execution_intent_audit_mutation();

alter table public.canonical_execution_intent_audits owner to postgres;
alter table public.canonical_execution_intent_audits enable row level security;

revoke all privileges on table public.canonical_execution_intent_audits
  from public, anon, authenticated, service_role;

comment on table public.canonical_execution_intent_audits is
  'Action 666JD source-only C-01 append-only pre-broker intent audit relation. RLS has zero policies and no runtime writer, route, database application or broker action is created by this migration.';

comment on column public.canonical_execution_intent_audits.semantic_payload_sha256 is
  'Lowercase SHA-256 of the deterministic server-created canonical intent payload. A future server writer must recompute it before insert and after every independent readback; mismatch is a conflict, never an update.';

comment on column public.canonical_execution_intent_audits.audit_envelope is
  'Immutable minimal audit envelope. It binds the owner, canonical intent identity, digest, idempotency key and pre-broker issuance state without broker credentials, browser artifacts, cookies, secrets or a broker result.';
