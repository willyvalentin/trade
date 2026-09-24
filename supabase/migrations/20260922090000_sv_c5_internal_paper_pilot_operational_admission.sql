-- SV-C5: immutable operational admission and durable heartbeat for the first
-- bounded internal-paper pilot.
--
-- This migration is inert after application. It creates no policy row,
-- account, heartbeat, schedule, provider request, queue job or broker path.
-- A policy can be frozen only through the service-role RPC with explicit data
-- entitlement/retention evidence and explicit bounded retention/storage values.

set lock_timeout = '5s';
set statement_timeout = '60s';

-- Production admission is deliberately empty-state only. C.5 adds the
-- operational gate over exact C.1-C.4/D.1 contracts; existing paper state or
-- catalog drift requires a separately reviewed migration.
do $$
declare
  v_handoff_function oid := pg_catalog.to_regprocedure(
    'public.app_read_internal_paper_handoff_context_v1(uuid,uuid,text)'
  );
  v_observer_function oid := pg_catalog.to_regprocedure(
    'public.app_read_internal_paper_observer_v1(uuid,uuid,text)'
  );
  v_sequence_last_value bigint;
  v_sequence_is_called boolean;
begin
  if pg_catalog.to_regclass('public.internal_paper_accounts') is null
    or pg_catalog.to_regclass('public.internal_paper_entry_intents') is null
    or pg_catalog.to_regclass('public.internal_paper_fills') is null
    or pg_catalog.to_regclass('public.internal_paper_positions') is null
    or pg_catalog.to_regclass('public.internal_paper_ledger_entries') is null
    or pg_catalog.to_regclass('public.internal_paper_exit_intents') is null
    or pg_catalog.to_regclass('public.internal_paper_exit_fills') is null
    or pg_catalog.to_regclass('public.internal_paper_worker_jobs') is null
    or pg_catalog.to_regclass('public.internal_paper_ledger_global_sequence') is null
  then
    raise exception 'sv_c5_required_c1_c2_c3_c4_d1_contract_missing';
  end if;

  if exists (select 1 from public.internal_paper_accounts)
    or exists (select 1 from public.internal_paper_entry_intents)
    or exists (select 1 from public.internal_paper_fills)
    or exists (select 1 from public.internal_paper_positions)
    or exists (select 1 from public.internal_paper_ledger_entries)
    or exists (select 1 from public.internal_paper_exit_intents)
    or exists (select 1 from public.internal_paper_exit_fills)
    or exists (select 1 from public.internal_paper_worker_jobs)
  then
    raise exception 'sv_c5_requires_empty_c1_c2_c3_state';
  end if;

  if exists (
    select 1
    from (values
      ('public.internal_paper_accounts', 'id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'owner_user_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'status', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'owner_user_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'account_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'contract_version', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'work_kind', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'payload', 'jsonb'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'payload_digest', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'priority', 'smallint'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'status', 'text'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'available_at', 'timestamptz'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'lease_owner', 'text'::pg_catalog.regtype, false),
      ('public.internal_paper_worker_jobs', 'lease_token', 'uuid'::pg_catalog.regtype, false),
      ('public.internal_paper_worker_jobs', 'lease_expires_at', 'timestamptz'::pg_catalog.regtype, false),
      ('public.internal_paper_worker_jobs', 'attempt_count', 'integer'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'max_attempts', 'integer'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'created_at', 'timestamptz'::pg_catalog.regtype, true),
      ('public.internal_paper_worker_jobs', 'updated_at', 'timestamptz'::pg_catalog.regtype, true)
    ) as expected(relation_name, column_name, type_oid, must_be_not_null)
    where not exists (
      select 1
      from pg_catalog.pg_attribute attribute
      where attribute.attrelid = pg_catalog.to_regclass(expected.relation_name)
        and attribute.attname = expected.column_name
        and attribute.atttypid = expected.type_oid
        and (not expected.must_be_not_null or attribute.attnotnull)
        and attribute.attnum > 0
        and not attribute.attisdropped
    )
  ) or not exists (
    select 1
    from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.internal_paper_accounts'::pg_catalog.regclass
      and constraint_record.contype = 'u'
      and constraint_record.convalidated
      and pg_catalog.pg_get_constraintdef(constraint_record.oid, true) =
        'UNIQUE (id, owner_user_id)'
  ) then
    raise exception 'sv_c5_unexpected_table_contract';
  end if;

  if exists (
    select 1
    from (values (v_handoff_function), (v_observer_function))
      as required(procedure_oid)
    where required.procedure_oid is null
      or not exists (
        select 1
        from pg_catalog.pg_proc procedure_record
        where procedure_record.oid = required.procedure_oid
          and procedure_record.prokind = 'f'
          and procedure_record.provolatile = 's'
          and procedure_record.prosecdef
          and procedure_record.proconfig @>
            array['search_path=pg_catalog, public']::text[]
      )
      or not pg_catalog.has_function_privilege(
        'service_role', required.procedure_oid, 'EXECUTE'
      )
      or pg_catalog.has_function_privilege(
        'anon', required.procedure_oid, 'EXECUTE'
      )
      or pg_catalog.has_function_privilege(
        'authenticated', required.procedure_oid, 'EXECUTE'
      )
  ) then
    raise exception 'sv_c5_unexpected_read_boundary_contract';
  end if;

  select last_value, is_called
  into v_sequence_last_value, v_sequence_is_called
  from public.internal_paper_ledger_global_sequence;
  if v_sequence_last_value <> 1 or v_sequence_is_called then
    raise exception 'sv_c5_requires_unconsumed_ledger_sequence';
  end if;

  if pg_catalog.to_regclass('public.internal_paper_pilot_policies') is not null
    or pg_catalog.to_regclass('public.internal_paper_worker_heartbeats') is not null
    or pg_catalog.to_regprocedure(
      'public.app_freeze_internal_paper_pilot_policy_v1(uuid,uuid,text,text,text,integer,bigint,timestamptz)'
    ) is not null
    or pg_catalog.to_regprocedure(
      'public.app_record_internal_paper_worker_heartbeat_v1(uuid,timestamptz,timestamptz,text,text)'
    ) is not null
    or pg_catalog.to_regprocedure(
      'public.app_claim_internal_paper_worker_job_v2(uuid,text,timestamptz,integer,text)'
    ) is not null
    or pg_catalog.to_regprocedure(
      'public.app_read_internal_paper_handoff_context_v2(uuid,uuid,text,timestamptz)'
    ) is not null
    or pg_catalog.to_regprocedure(
      'public.app_read_internal_paper_observer_v2(uuid,uuid,text)'
    ) is not null
  then
    raise exception 'sv_c5_preexisting_operational_admission_contract';
  end if;
end;
$$;

create table public.internal_paper_pilot_policies (
  account_id uuid primary key,
  owner_user_id uuid not null,
  policy_version text not null
    check (policy_version = 'internal_paper_pilot_operating_policy_2026_09_22_v1'),
  provider_plan text not null check (provider_plan = 'twelve_data_basic_free'),
  entitlement_evidence_reference text not null
    check (length(entitlement_evidence_reference) between 1 and 500),
  retention_rights_evidence_reference text not null
    check (length(retention_rights_evidence_reference) between 1 and 500),
  derived_evidence_retention_days integer not null
    check (derived_evidence_retention_days between 1 and 3650),
  max_derived_evidence_bytes bigint not null
    check (max_derived_evidence_bytes between 1048576 and 10737418240),
  max_raw_provider_payload_bytes bigint not null default 0
    check (max_raw_provider_payload_bytes = 0),
  max_daily_provider_credits smallint not null default 800
    check (max_daily_provider_credits = 800),
  max_per_minute_provider_credits smallint not null default 8
    check (max_per_minute_provider_credits = 8),
  retry_reserve_credits smallint not null default 8
    check (retry_reserve_credits = 8),
  monthly_incremental_spend_cap_usd numeric(12, 2) not null default 0
    check (monthly_incremental_spend_cap_usd = 0),
  max_source_age_seconds integer not null default 600
    check (max_source_age_seconds = 600),
  max_decision_to_intent_seconds integer not null default 120
    check (max_decision_to_intent_seconds = 120),
  worker_heartbeat_interval_seconds integer not null default 900
    check (worker_heartbeat_interval_seconds = 900),
  worker_detection_timeout_seconds integer not null default 1200
    check (worker_detection_timeout_seconds = 1200),
  max_scan_runtime_seconds integer not null default 120
    check (max_scan_runtime_seconds = 120),
  restart_reconciliation_deadline_seconds integer not null default 1200
    check (restart_reconciliation_deadline_seconds = 1200),
  acknowledged_effect_recovery_point_seconds integer not null default 0
    check (acknowledged_effect_recovery_point_seconds = 0),
  frozen_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (account_id, owner_user_id),
  foreign key (account_id, owner_user_id)
    references public.internal_paper_accounts(id, owner_user_id) on delete restrict
);

create table public.internal_paper_worker_heartbeats (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  account_id uuid not null,
  policy_version text not null
    check (policy_version = 'internal_paper_pilot_operating_policy_2026_09_22_v1'),
  host_version text not null check (host_version = 'internal_paper_worker_host_v1'),
  slot_started_at timestamptz not null,
  observed_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (account_id, slot_started_at),
  foreign key (account_id, owner_user_id)
    references public.internal_paper_accounts(id, owner_user_id) on delete restrict,
  foreign key (account_id, owner_user_id)
    references public.internal_paper_pilot_policies(account_id, owner_user_id)
      on delete restrict,
  check (
    observed_at >= slot_started_at
    and observed_at <= slot_started_at + interval '3 minutes'
  )
);

create index internal_paper_worker_heartbeats_account_observed_idx
  on public.internal_paper_worker_heartbeats(account_id, observed_at desc);
create index internal_paper_worker_heartbeats_account_owner_idx
  on public.internal_paper_worker_heartbeats(account_id, owner_user_id);

alter table public.internal_paper_pilot_policies enable row level security;
alter table public.internal_paper_worker_heartbeats enable row level security;
revoke all privileges on table public.internal_paper_pilot_policies
  from public, anon, authenticated, service_role;
revoke all privileges on table public.internal_paper_worker_heartbeats
  from public, anon, authenticated, service_role;

create function public.app_freeze_internal_paper_pilot_policy_v1(
  p_owner_user_id uuid,
  p_account_id uuid,
  p_policy_version text,
  p_entitlement_evidence_reference text,
  p_retention_rights_evidence_reference text,
  p_derived_evidence_retention_days integer,
  p_max_derived_evidence_bytes bigint,
  p_frozen_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_account public.internal_paper_accounts%rowtype;
  v_existing public.internal_paper_pilot_policies%rowtype;
  v_disposition text := 'created';
begin
  if p_owner_user_id is null or p_account_id is null
    or p_policy_version is distinct from
      'internal_paper_pilot_operating_policy_2026_09_22_v1'
    or p_entitlement_evidence_reference is null
    or length(p_entitlement_evidence_reference) not between 1 and 500
    or p_retention_rights_evidence_reference is null
    or length(p_retention_rights_evidence_reference) not between 1 and 500
    or p_derived_evidence_retention_days is null
    or p_derived_evidence_retention_days not between 1 and 3650
    or p_max_derived_evidence_bytes is null
    or p_max_derived_evidence_bytes not between 1048576 and 10737418240
    or p_frozen_at is null
  then raise exception 'invalid_internal_paper_pilot_policy'; end if;

  select * into v_account
  from public.internal_paper_accounts account
  where account.id = p_account_id
    and account.owner_user_id = p_owner_user_id
  for update;
  if not found then raise exception 'internal_paper_account_not_found'; end if;
  if v_account.status <> 'paused' then
    raise exception 'internal_paper_policy_requires_paused_account';
  end if;

  select * into v_existing
  from public.internal_paper_pilot_policies policy
  where policy.account_id = p_account_id
  for share;
  if found then
    if v_existing.owner_user_id is distinct from p_owner_user_id
      or v_existing.policy_version is distinct from p_policy_version
      or v_existing.entitlement_evidence_reference is distinct from
        p_entitlement_evidence_reference
      or v_existing.retention_rights_evidence_reference is distinct from
        p_retention_rights_evidence_reference
      or v_existing.derived_evidence_retention_days is distinct from
        p_derived_evidence_retention_days
      or v_existing.max_derived_evidence_bytes is distinct from
        p_max_derived_evidence_bytes
      or v_existing.frozen_at is distinct from p_frozen_at
    then raise exception 'internal_paper_pilot_policy_conflict'; end if;
    v_disposition := 'reused';
  else
    insert into public.internal_paper_pilot_policies(
      account_id, owner_user_id, policy_version, provider_plan,
      entitlement_evidence_reference, retention_rights_evidence_reference,
      derived_evidence_retention_days, max_derived_evidence_bytes, frozen_at
    ) values (
      p_account_id, p_owner_user_id, p_policy_version,
      'twelve_data_basic_free', p_entitlement_evidence_reference,
      p_retention_rights_evidence_reference,
      p_derived_evidence_retention_days, p_max_derived_evidence_bytes,
      p_frozen_at
    ) returning * into v_existing;
  end if;

  return jsonb_build_object(
    'policy_version', v_existing.policy_version,
    'account_id', v_existing.account_id,
    'owner_user_id', v_existing.owner_user_id,
    'disposition', v_disposition,
    'provider_plan', v_existing.provider_plan,
    'max_daily_provider_credits', v_existing.max_daily_provider_credits,
    'max_per_minute_provider_credits', v_existing.max_per_minute_provider_credits,
    'retry_reserve_credits', v_existing.retry_reserve_credits,
    'max_raw_provider_payload_bytes', v_existing.max_raw_provider_payload_bytes,
    'max_derived_evidence_bytes', v_existing.max_derived_evidence_bytes,
    'derived_evidence_retention_days', v_existing.derived_evidence_retention_days,
    'monthly_incremental_spend_cap_usd', v_existing.monthly_incremental_spend_cap_usd,
    'max_source_age_seconds', v_existing.max_source_age_seconds,
    'max_decision_to_intent_seconds', v_existing.max_decision_to_intent_seconds,
    'worker_heartbeat_interval_seconds', v_existing.worker_heartbeat_interval_seconds,
    'worker_detection_timeout_seconds', v_existing.worker_detection_timeout_seconds,
    'max_scan_runtime_seconds', v_existing.max_scan_runtime_seconds,
    'restart_reconciliation_deadline_seconds',
      v_existing.restart_reconciliation_deadline_seconds,
    'acknowledged_effect_recovery_point_seconds',
      v_existing.acknowledged_effect_recovery_point_seconds,
    'frozen_at', v_existing.frozen_at
  );
end;
$$;

revoke all on function public.app_freeze_internal_paper_pilot_policy_v1(
  uuid, uuid, text, text, text, integer, bigint, timestamptz
) from public, anon, authenticated;
grant execute on function public.app_freeze_internal_paper_pilot_policy_v1(
  uuid, uuid, text, text, text, integer, bigint, timestamptz
) to service_role;

create function public.app_record_internal_paper_worker_heartbeat_v1(
  p_account_id uuid,
  p_slot_started_at timestamptz,
  p_observed_at timestamptz,
  p_host_version text,
  p_policy_version text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_policy public.internal_paper_pilot_policies%rowtype;
  v_heartbeat public.internal_paper_worker_heartbeats%rowtype;
  v_disposition text := 'created';
begin
  if p_account_id is null or p_slot_started_at is null or p_observed_at is null
    or p_host_version is distinct from 'internal_paper_worker_host_v1'
    or p_policy_version is distinct from
      'internal_paper_pilot_operating_policy_2026_09_22_v1'
    or p_observed_at < p_slot_started_at
    or p_observed_at > p_slot_started_at + interval '3 minutes'
    or mod(extract(epoch from p_slot_started_at)::bigint, 900) <> 0
  then raise exception 'invalid_internal_paper_worker_heartbeat'; end if;

  select * into v_policy
  from public.internal_paper_pilot_policies policy
  where policy.account_id = p_account_id
    and policy.policy_version = p_policy_version;
  if not found then raise exception 'internal_paper_pilot_policy_unavailable'; end if;

  insert into public.internal_paper_worker_heartbeats(
    owner_user_id, account_id, policy_version, host_version,
    slot_started_at, observed_at
  ) values (
    v_policy.owner_user_id, v_policy.account_id, v_policy.policy_version,
    p_host_version, p_slot_started_at, p_observed_at
  )
  on conflict (account_id, slot_started_at) do nothing
  returning * into v_heartbeat;

  if not found then
    select * into v_heartbeat
    from public.internal_paper_worker_heartbeats heartbeat
    where heartbeat.account_id = p_account_id
      and heartbeat.slot_started_at = p_slot_started_at;
    if v_heartbeat.host_version is distinct from p_host_version
      or v_heartbeat.policy_version is distinct from p_policy_version
    then raise exception 'internal_paper_worker_heartbeat_conflict'; end if;
    v_disposition := 'reused';
  end if;

  return jsonb_build_object(
    'heartbeat_version', 'internal_paper_worker_heartbeat_v1',
    'heartbeat_id', v_heartbeat.id,
    'owner_user_id', v_heartbeat.owner_user_id,
    'account_id', v_heartbeat.account_id,
    'policy_version', v_heartbeat.policy_version,
    'host_version', v_heartbeat.host_version,
    'slot_started_at', v_heartbeat.slot_started_at,
    'observed_at', v_heartbeat.observed_at,
    'disposition', v_disposition
  );
end;
$$;

revoke all on function public.app_record_internal_paper_worker_heartbeat_v1(
  uuid, timestamptz, timestamptz, text, text
) from public, anon, authenticated;
grant execute on function public.app_record_internal_paper_worker_heartbeat_v1(
  uuid, timestamptz, timestamptz, text, text
) to service_role;

create function public.app_claim_internal_paper_worker_job_v2(
  p_account_id uuid,
  p_worker_id text,
  p_now timestamptz,
  p_lease_seconds integer,
  p_claim_version text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_policy public.internal_paper_pilot_policies%rowtype;
  v_latest_heartbeat timestamptz;
  v_job public.internal_paper_worker_jobs%rowtype;
begin
  if p_account_id is null
    or p_claim_version is distinct from 'internal_paper_worker_claim_v2'
    or p_worker_id is null or length(p_worker_id) not between 1 and 120
    or p_now is null or p_lease_seconds is null
    or p_lease_seconds not between 15 and 300
  then raise exception 'invalid_internal_paper_worker_claim'; end if;

  select policy.* into v_policy
  from public.internal_paper_pilot_policies policy
  join public.internal_paper_accounts account
    on account.id = policy.account_id
    and account.owner_user_id = policy.owner_user_id
  where policy.account_id = p_account_id
    and account.status = 'ready';
  if not found then
    return jsonb_build_object(
      'claim_version', p_claim_version,
      'status', 'blocked',
      'reason_code', 'pilot_policy_or_ready_account_unavailable'
    );
  end if;

  select max(heartbeat.observed_at) into v_latest_heartbeat
  from public.internal_paper_worker_heartbeats heartbeat
  where heartbeat.account_id = p_account_id
    and heartbeat.policy_version = v_policy.policy_version;
  if v_latest_heartbeat is null
    or v_latest_heartbeat > p_now
    or p_now - v_latest_heartbeat >
      make_interval(secs => v_policy.worker_detection_timeout_seconds)
  then
    return jsonb_build_object(
      'claim_version', p_claim_version,
      'status', 'blocked',
      'reason_code', 'worker_heartbeat_not_current'
    );
  end if;

  with claimable as (
    select job.id
    from public.internal_paper_worker_jobs job
    where job.account_id = p_account_id
      and (
        (job.status = 'queued' and job.available_at <= p_now)
        or (job.status = 'leased' and job.lease_expires_at <= p_now)
      )
      and not exists (
        select 1 from public.internal_paper_worker_jobs active
        where active.account_id = job.account_id and active.id <> job.id
          and active.status = 'leased' and active.lease_expires_at > p_now
      )
    order by job.priority, job.available_at, job.created_at, job.id
    limit 1
    for update skip locked
  )
  update public.internal_paper_worker_jobs job
  set status = 'leased', lease_owner = p_worker_id,
      lease_token = gen_random_uuid(),
      lease_expires_at = p_now + make_interval(secs => p_lease_seconds),
      attempt_count = job.attempt_count + 1, updated_at = p_now
  from claimable where job.id = claimable.id
  returning job.* into v_job;

  if not found then
    return jsonb_build_object('claim_version', p_claim_version, 'status', 'no_work');
  end if;
  return jsonb_build_object(
    'claim_version', p_claim_version,
    'contract_version', v_job.contract_version,
    'status', 'claimed', 'job_id', v_job.id,
    'owner_user_id', v_job.owner_user_id, 'account_id', v_job.account_id,
    'work_kind', v_job.work_kind, 'payload', v_job.payload,
    'payload_digest', v_job.payload_digest, 'lease_token', v_job.lease_token,
    'lease_expires_at', v_job.lease_expires_at,
    'attempt_count', v_job.attempt_count, 'max_attempts', v_job.max_attempts
  );
end;
$$;

revoke all on function public.app_claim_internal_paper_worker_job_v2(
  uuid, text, timestamptz, integer, text
) from public, anon, authenticated;
grant execute on function public.app_claim_internal_paper_worker_job_v2(
  uuid, text, timestamptz, integer, text
) to service_role;

create function public.app_read_internal_paper_handoff_context_v2(
  p_owner_user_id uuid,
  p_account_id uuid,
  p_context_version text,
  p_observed_at timestamptz
)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_account public.internal_paper_accounts%rowtype;
  v_policy public.internal_paper_pilot_policies%rowtype;
  v_latest_heartbeat timestamptz;
  v_admission_status text := 'blocked';
  v_reason_codes jsonb := '[]'::jsonb;
begin
  if p_context_version is distinct from 'internal_paper_handoff_context_v2'
    or p_owner_user_id is null or p_account_id is null or p_observed_at is null
  then raise exception 'invalid_internal_paper_handoff_context_command'; end if;

  select * into v_account from public.internal_paper_accounts account
  where account.owner_user_id = p_owner_user_id and account.id = p_account_id;
  if not found then raise exception 'internal_paper_handoff_account_not_found'; end if;

  select * into v_policy from public.internal_paper_pilot_policies policy
  where policy.owner_user_id = p_owner_user_id and policy.account_id = p_account_id;
  if not found then
    v_reason_codes := '["pilot_policy_missing"]'::jsonb;
  else
    select max(heartbeat.observed_at) into v_latest_heartbeat
    from public.internal_paper_worker_heartbeats heartbeat
    where heartbeat.account_id = p_account_id
      and heartbeat.policy_version = v_policy.policy_version;
    if v_latest_heartbeat is null then
      v_reason_codes := '["worker_heartbeat_missing"]'::jsonb;
    elsif v_latest_heartbeat > p_observed_at then
      v_reason_codes := '["worker_heartbeat_from_future"]'::jsonb;
    elsif p_observed_at - v_latest_heartbeat >
      make_interval(secs => v_policy.worker_detection_timeout_seconds)
    then
      v_reason_codes := '["worker_heartbeat_stale"]'::jsonb;
    else
      v_admission_status := 'ready';
    end if;
  end if;

  return jsonb_build_object(
    'context_version', 'internal_paper_handoff_context_v2',
    'observed_at', p_observed_at,
    'owner_user_id', v_account.owner_user_id,
    'account_id', v_account.id,
    'status', v_account.status,
    'config_version', v_account.config_version,
    'strategy_id', v_account.strategy_id,
    'strategy_version', v_account.strategy_version,
    'strategy_rollback_identity', v_account.strategy_rollback_identity,
    'symbol_selection_policy_id', v_account.symbol_selection_policy_id,
    'symbol_selection_policy_version', v_account.symbol_selection_policy_version,
    'observed_universe_version', v_account.observed_universe_version,
    'eligible_symbols', to_jsonb(v_account.eligible_symbols),
    'cash_balance', v_account.cash_balance,
    'per_trade_risk_cap', v_account.per_trade_risk_cap,
    'spread_bps', v_account.spread_bps,
    'slippage_bps', v_account.slippage_bps,
    'commission_per_order', v_account.commission_per_order,
    'operational_admission', jsonb_build_object(
      'status', v_admission_status,
      'reason_codes', v_reason_codes,
      'policy_version', v_policy.policy_version,
      'provider_plan', v_policy.provider_plan,
      'max_daily_provider_credits', v_policy.max_daily_provider_credits,
      'max_per_minute_provider_credits', v_policy.max_per_minute_provider_credits,
      'retry_reserve_credits', v_policy.retry_reserve_credits,
      'max_source_age_seconds', v_policy.max_source_age_seconds,
      'max_decision_to_intent_seconds', v_policy.max_decision_to_intent_seconds,
      'worker_heartbeat_interval_seconds', v_policy.worker_heartbeat_interval_seconds,
      'worker_detection_timeout_seconds', v_policy.worker_detection_timeout_seconds,
      'max_scan_runtime_seconds', v_policy.max_scan_runtime_seconds,
      'restart_reconciliation_deadline_seconds',
        v_policy.restart_reconciliation_deadline_seconds,
      'acknowledged_effect_recovery_point_seconds',
        v_policy.acknowledged_effect_recovery_point_seconds,
      'max_raw_provider_payload_bytes', v_policy.max_raw_provider_payload_bytes,
      'max_derived_evidence_bytes', v_policy.max_derived_evidence_bytes,
      'derived_evidence_retention_days', v_policy.derived_evidence_retention_days,
      'monthly_incremental_spend_cap_usd',
        v_policy.monthly_incremental_spend_cap_usd,
      'latest_worker_heartbeat_at', v_latest_heartbeat
    )
  );
end;
$$;

revoke all on function public.app_read_internal_paper_handoff_context_v2(
  uuid, uuid, text, timestamptz
) from public, anon, authenticated;
grant execute on function public.app_read_internal_paper_handoff_context_v2(
  uuid, uuid, text, timestamptz
) to service_role;

create function public.app_read_internal_paper_observer_v2(
  p_owner_user_id uuid,
  p_account_id uuid,
  p_observer_version text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_base jsonb;
  v_policy public.internal_paper_pilot_policies%rowtype;
  v_latest_heartbeat timestamptz;
  v_observed_at timestamptz;
  v_heartbeat_classification text := 'missing';
  v_admission_status text := 'blocked';
begin
  if p_observer_version is distinct from 'internal_paper_observer_v2'
  then raise exception 'invalid_internal_paper_observer_command'; end if;
  v_base := public.app_read_internal_paper_observer_v1(
    p_owner_user_id, p_account_id, 'internal_paper_observer_v1'
  );
  v_observed_at := (v_base ->> 'observed_at')::timestamptz;

  select * into v_policy from public.internal_paper_pilot_policies policy
  where policy.owner_user_id = p_owner_user_id and policy.account_id = p_account_id;
  if found then
    select max(heartbeat.observed_at) into v_latest_heartbeat
    from public.internal_paper_worker_heartbeats heartbeat
    where heartbeat.account_id = p_account_id
      and heartbeat.policy_version = v_policy.policy_version;
    if v_latest_heartbeat is null then
      v_heartbeat_classification := 'missing';
    elsif v_latest_heartbeat > v_observed_at then
      v_heartbeat_classification := 'invalid_future';
    elsif v_observed_at - v_latest_heartbeat >
      make_interval(secs => v_policy.worker_detection_timeout_seconds)
    then
      v_heartbeat_classification := 'stale';
    else
      v_heartbeat_classification := 'fresh';
      v_admission_status := 'ready';
    end if;
  end if;

  return v_base || jsonb_build_object(
    'observer_version', 'internal_paper_observer_v2',
    'operational_admission', jsonb_build_object(
      'status', v_admission_status,
      'policy_version', v_policy.policy_version,
      'provider_plan', v_policy.provider_plan,
      'max_source_age_seconds', v_policy.max_source_age_seconds,
      'max_decision_to_intent_seconds', v_policy.max_decision_to_intent_seconds,
      'heartbeat_interval_seconds', v_policy.worker_heartbeat_interval_seconds,
      'detection_timeout_seconds', v_policy.worker_detection_timeout_seconds,
      'restart_reconciliation_deadline_seconds',
        v_policy.restart_reconciliation_deadline_seconds,
      'recovery_point_seconds', v_policy.acknowledged_effect_recovery_point_seconds,
      'derived_evidence_retention_days', v_policy.derived_evidence_retention_days,
      'max_derived_evidence_bytes', v_policy.max_derived_evidence_bytes,
      'monthly_incremental_spend_cap_usd',
        v_policy.monthly_incremental_spend_cap_usd,
      'latest_worker_heartbeat_at', v_latest_heartbeat,
      'heartbeat_classification', v_heartbeat_classification
    )
  );
end;
$$;

revoke all on function public.app_read_internal_paper_observer_v2(
  uuid, uuid, text
) from public, anon, authenticated;
grant execute on function public.app_read_internal_paper_observer_v2(
  uuid, uuid, text
) to service_role;

comment on table public.internal_paper_pilot_policies is
  'SV-C5 immutable first-pilot operating limits. No row is created by migration; missing entitlement/retention evidence keeps paper handoff blocked.';
comment on table public.internal_paper_worker_heartbeats is
  'SV-C5 durable account-scoped scheduled-worker liveness evidence; it is not market data, a fill or execution authority.';
