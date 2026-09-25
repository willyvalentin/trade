-- SV-C3: durable, restart-safe internal-paper worker queue.
--
-- Source-only and inert after migration. This creates no schedule, worker
-- process, account, provider request, candidate publication or broker path.
-- Jobs are service-role-only and can execute only the already fail-closed,
-- idempotent C1/C2 paper entry and exit database boundaries.

set lock_timeout = '5s';
set statement_timeout = '60s';

-- Production admission is deliberately empty-state only. The queue is an
-- execution boundary over the exact C.1/C.2 contract, so any existing paper
-- state or catalog drift requires a separately reviewed migration.
do $$
declare
  v_entry_function oid := pg_catalog.to_regprocedure(
    'public.app_apply_internal_paper_entry_v1(uuid,uuid,text,text,text,text,text,text,text,text,text,text,text,text,bigint,numeric,numeric,numeric,timestamptz,text,text)'
  );
  v_exit_function oid := pg_catalog.to_regprocedure(
    'public.app_apply_internal_paper_exit_v1(uuid,uuid,uuid,uuid,text,text,text)'
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
    or pg_catalog.to_regclass('public.internal_paper_ledger_global_sequence') is null
  then
    raise exception 'sv_c3_required_c1_c2_contract_missing';
  end if;

  if exists (select 1 from public.internal_paper_accounts)
    or exists (select 1 from public.internal_paper_entry_intents)
    or exists (select 1 from public.internal_paper_fills)
    or exists (select 1 from public.internal_paper_positions)
    or exists (select 1 from public.internal_paper_ledger_entries)
    or exists (select 1 from public.internal_paper_exit_intents)
    or exists (select 1 from public.internal_paper_exit_fills)
  then
    raise exception 'sv_c3_requires_empty_c1_c2_state';
  end if;

  if exists (
    select 1
    from (values
      ('public.internal_paper_accounts', 'id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'owner_user_id', 'uuid'::pg_catalog.regtype, true),
      ('public.internal_paper_accounts', 'status', 'text'::pg_catalog.regtype, true),
      ('public.recommendation_scan_runs', 'id', 'text'::pg_catalog.regtype, true),
      ('public.recommendation_scan_runs', 'run_fingerprint', 'text'::pg_catalog.regtype, true),
      ('public.recommendation_scan_runs', 'owner_user_id', 'uuid'::pg_catalog.regtype, false),
      ('public.recommendation_scan_runs', 'payload_json', 'jsonb'::pg_catalog.regtype, true)
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
    raise exception 'sv_c3_unexpected_c1_c2_table_contract';
  end if;

  if v_entry_function is null or v_exit_function is null or exists (
    select 1
    from (values (v_entry_function), (v_exit_function)) as required(procedure_oid)
    where not exists (
      select 1
      from pg_catalog.pg_proc procedure_record
      where procedure_record.oid = required.procedure_oid
        and procedure_record.prokind = 'f'
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
    raise exception 'sv_c3_unexpected_c1_c2_function_contract';
  end if;

  select last_value, is_called
  into v_sequence_last_value, v_sequence_is_called
  from public.internal_paper_ledger_global_sequence;
  if v_sequence_last_value <> 1 or v_sequence_is_called then
    raise exception 'sv_c3_requires_unconsumed_ledger_sequence';
  end if;

  if pg_catalog.to_regclass('public.internal_paper_worker_jobs') is not null
    or pg_catalog.to_regprocedure(
      'public.app_enqueue_internal_paper_worker_job_v1(uuid,uuid,text,jsonb,text)'
    ) is not null
    or pg_catalog.to_regprocedure(
      'public.app_claim_internal_paper_worker_job_v1(text,timestamptz,integer,text)'
    ) is not null
    or pg_catalog.to_regprocedure(
      'public.app_execute_internal_paper_worker_job_v1(uuid,uuid,timestamptz,text)'
    ) is not null
    or pg_catalog.to_regprocedure(
      'public.app_release_internal_paper_worker_job_v1(uuid,uuid,timestamptz,timestamptz,text,text)'
    ) is not null
    or pg_catalog.to_regprocedure(
      'public.app_read_internal_paper_worker_v1(uuid,uuid,text)'
    ) is not null
  then
    raise exception 'sv_c3_preexisting_worker_contract';
  end if;
end;
$$;

create table public.internal_paper_worker_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  account_id uuid not null,
  contract_version text not null
    check (contract_version = 'internal_paper_worker_job_v1'),
  work_kind text not null check (work_kind in ('entry', 'exit', 'no_trade')),
  work_key text not null check (work_key ~ '^[0-9a-f]{64}$'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  payload_digest text not null check (payload_digest ~ '^[0-9a-f]{64}$'),
  priority smallint not null check (priority between 0 and 1000),
  status text not null default 'queued'
    check (status in ('queued', 'leased', 'completed', 'no_trade', 'blocked')),
  available_at timestamptz not null default now(),
  lease_owner text null,
  lease_token uuid null,
  lease_expires_at timestamptz null,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 5 check (max_attempts between 1 and 20),
  last_failure_code text null
    check (last_failure_code is null or last_failure_code ~ '^[a-z0-9_]{1,80}$'),
  result jsonb null check (result is null or jsonb_typeof(result) = 'object'),
  result_digest text null
    check (result_digest is null or result_digest ~ '^[0-9a-f]{64}$'),
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, account_id, owner_user_id),
  unique (account_id, work_key),
  foreign key (account_id, owner_user_id)
    references public.internal_paper_accounts(id, owner_user_id)
    on delete restrict,
  check (
    (status = 'leased'
      and lease_owner is not null and length(lease_owner) between 1 and 120
      and lease_token is not null and lease_expires_at is not null)
    or
    (status <> 'leased'
      and lease_owner is null and lease_token is null and lease_expires_at is null)
  ),
  check (
    (status in ('completed', 'no_trade')
      and result is not null and result_digest is not null
      and completed_at is not null)
    or
    (status not in ('completed', 'no_trade')
      and result is null and result_digest is null and completed_at is null)
  )
);

create index internal_paper_worker_jobs_claim_idx
  on public.internal_paper_worker_jobs (
    priority, available_at, created_at, id
  )
  where status in ('queued', 'leased');
create index internal_paper_worker_jobs_account_created_idx
  on public.internal_paper_worker_jobs (account_id, created_at desc, id desc);
create index internal_paper_worker_jobs_owner_idx
  on public.internal_paper_worker_jobs (owner_user_id);
create index internal_paper_worker_jobs_account_owner_idx
  on public.internal_paper_worker_jobs (account_id, owner_user_id);
create unique index internal_paper_worker_jobs_one_live_lease_per_account_uidx
  on public.internal_paper_worker_jobs (account_id)
  where status = 'leased';

alter table public.internal_paper_worker_jobs enable row level security;
revoke all privileges on table public.internal_paper_worker_jobs
  from public, anon, authenticated, service_role;

create function public.app_enqueue_internal_paper_worker_job_v1(
  p_owner_user_id uuid,
  p_account_id uuid,
  p_work_kind text,
  p_payload jsonb,
  p_contract_version text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_account public.internal_paper_accounts%rowtype;
  v_existing public.internal_paper_worker_jobs%rowtype;
  v_work_key text;
  v_payload_digest text;
  v_priority smallint;
  v_job_id uuid;
begin
  if p_contract_version <> 'internal_paper_worker_job_v1'
    or p_owner_user_id is null or p_account_id is null
    or p_work_kind is null or p_work_kind not in ('entry', 'exit', 'no_trade')
    or p_payload is null or jsonb_typeof(p_payload) <> 'object'
  then
    raise exception 'invalid_internal_paper_worker_job';
  end if;

  select * into v_account
  from public.internal_paper_accounts
  where id = p_account_id and owner_user_id = p_owner_user_id
  for share;
  if not found then raise exception 'internal_paper_account_not_found'; end if;

  if p_work_kind = 'entry' then
    if p_payload ->> 'command_version' <> 'internal_paper_entry_command_v1'
      or p_payload ->> 'owner_user_id' <> p_owner_user_id::text
      or p_payload ->> 'account_id' <> p_account_id::text
      or coalesce(p_payload ->> 'scan_run_fingerprint', '') = ''
      or coalesce(p_payload ->> 'candidate_identity', '') = ''
      or coalesce(p_payload ->> 'snapshot_fingerprint', '') = ''
    then raise exception 'invalid_internal_paper_entry_worker_payload'; end if;
    v_work_key := encode(extensions.digest(convert_to(concat_ws(
      ':', 'internal_paper_worker_entry_v1', p_account_id,
      p_payload ->> 'scan_run_fingerprint',
      p_payload ->> 'candidate_identity',
      p_payload ->> 'snapshot_fingerprint'
    ), 'UTF8'), 'sha256'), 'hex');
    v_priority := 100;
  elsif p_work_kind = 'exit' then
    if p_payload ->> 'command_version' <> 'internal_paper_exit_command_v1'
      or p_payload ->> 'owner_user_id' <> p_owner_user_id::text
      or p_payload ->> 'account_id' <> p_account_id::text
      or coalesce(p_payload ->> 'position_id', '') = ''
      or coalesce(p_payload ->> 'candle_id', '') = ''
    then raise exception 'invalid_internal_paper_exit_worker_payload'; end if;
    v_work_key := encode(extensions.digest(convert_to(concat_ws(
      ':', 'internal_paper_worker_exit_v1', p_account_id,
      p_payload ->> 'position_id', p_payload ->> 'candle_id'
    ), 'UTF8'), 'sha256'), 'hex');
    v_priority := 0;
  else
    if p_payload ->> 'record_version' <> 'candidate_decision_record_v3'
      or p_payload ->> 'disposition' <> 'no_trade'
      or coalesce(p_payload ->> 'scan_run_id', '') = ''
      or coalesce(p_payload ->> 'scan_run_fingerprint', '') = ''
      or coalesce(p_payload ->> 'no_trade_reason', '') = ''
    then raise exception 'invalid_internal_paper_no_trade_worker_payload'; end if;
    v_work_key := encode(extensions.digest(convert_to(concat_ws(
      ':', 'internal_paper_worker_no_trade_v1', p_account_id,
      p_payload ->> 'scan_run_fingerprint'
    ), 'UTF8'), 'sha256'), 'hex');
    v_priority := 200;
  end if;

  v_payload_digest := encode(extensions.digest(
    convert_to(p_payload::text, 'UTF8'), 'sha256'
  ), 'hex');

  select * into v_existing
  from public.internal_paper_worker_jobs
  where account_id = p_account_id and work_key = v_work_key;
  if found then
    if v_existing.owner_user_id <> p_owner_user_id
      or v_existing.work_kind <> p_work_kind
      or v_existing.payload_digest <> v_payload_digest
    then raise exception 'internal_paper_worker_job_conflict'; end if;
    return jsonb_build_object(
      'job_id', v_existing.id,
      'disposition', 'reused',
      'status', v_existing.status,
      'work_kind', v_existing.work_kind
    );
  end if;

  insert into public.internal_paper_worker_jobs (
    owner_user_id, account_id, contract_version, work_kind, work_key,
    payload, payload_digest, priority
  ) values (
    p_owner_user_id, p_account_id, p_contract_version, p_work_kind, v_work_key,
    p_payload, v_payload_digest, v_priority
  ) returning id into v_job_id;

  return jsonb_build_object(
    'job_id', v_job_id,
    'disposition', 'created',
    'status', 'queued',
    'work_kind', p_work_kind
  );
end;
$$;

revoke all on function public.app_enqueue_internal_paper_worker_job_v1(
  uuid, uuid, text, jsonb, text
) from public, anon, authenticated;
grant execute on function public.app_enqueue_internal_paper_worker_job_v1(
  uuid, uuid, text, jsonb, text
) to service_role;

create function public.app_claim_internal_paper_worker_job_v1(
  p_worker_id text,
  p_now timestamptz,
  p_lease_seconds integer,
  p_contract_version text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_job public.internal_paper_worker_jobs%rowtype;
begin
  if p_contract_version <> 'internal_paper_worker_job_v1'
    or p_worker_id is null or length(p_worker_id) not between 1 and 120
    or p_now is null or p_lease_seconds is null
    or p_lease_seconds not between 15 and 300
  then raise exception 'invalid_internal_paper_worker_claim'; end if;

  with claimable as (
    select job.id
    from public.internal_paper_worker_jobs job
    where (
      (job.status = 'queued' and job.available_at <= p_now)
      or (job.status = 'leased' and job.lease_expires_at <= p_now)
    )
      and not exists (
        select 1
        from public.internal_paper_worker_jobs active
        where active.account_id = job.account_id
          and active.id <> job.id
          and active.status = 'leased'
          and active.lease_expires_at > p_now
      )
    order by job.priority, job.available_at, job.created_at, job.id
    limit 1
    for update skip locked
  )
  update public.internal_paper_worker_jobs job
  set status = 'leased',
      lease_owner = p_worker_id,
      lease_token = gen_random_uuid(),
      lease_expires_at = p_now + make_interval(secs => p_lease_seconds),
      attempt_count = job.attempt_count + 1,
      updated_at = p_now
  from claimable
  where job.id = claimable.id
  returning job.* into v_job;

  if not found then
    return jsonb_build_object(
      'contract_version', p_contract_version,
      'status', 'no_work'
    );
  end if;

  return jsonb_build_object(
    'contract_version', v_job.contract_version,
    'status', 'claimed',
    'job_id', v_job.id,
    'owner_user_id', v_job.owner_user_id,
    'account_id', v_job.account_id,
    'work_kind', v_job.work_kind,
    'payload', v_job.payload,
    'payload_digest', v_job.payload_digest,
    'lease_token', v_job.lease_token,
    'lease_expires_at', v_job.lease_expires_at,
    'attempt_count', v_job.attempt_count,
    'max_attempts', v_job.max_attempts
  );
end;
$$;

revoke all on function public.app_claim_internal_paper_worker_job_v1(
  text, timestamptz, integer, text
) from public, anon, authenticated;
grant execute on function public.app_claim_internal_paper_worker_job_v1(
  text, timestamptz, integer, text
) to service_role;

create function public.app_execute_internal_paper_worker_job_v1(
  p_job_id uuid,
  p_lease_token uuid,
  p_now timestamptz,
  p_contract_version text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_job public.internal_paper_worker_jobs%rowtype;
  v_scan public.recommendation_scan_runs%rowtype;
  v_effect jsonb;
  v_result jsonb;
  v_terminal_status text;
  v_result_digest text;
begin
  if p_contract_version <> 'internal_paper_worker_job_v1'
    or p_job_id is null or p_lease_token is null or p_now is null
  then raise exception 'invalid_internal_paper_worker_execute'; end if;

  select * into v_job
  from public.internal_paper_worker_jobs
  where id = p_job_id
  for update;
  if not found then raise exception 'internal_paper_worker_job_not_found'; end if;
  if v_job.contract_version <> p_contract_version
    or v_job.status <> 'leased'
    or v_job.lease_token <> p_lease_token
    or v_job.lease_expires_at <= p_now
  then raise exception 'internal_paper_worker_lease_invalid'; end if;
  if v_job.payload_digest <> encode(extensions.digest(
    convert_to(v_job.payload::text, 'UTF8'), 'sha256'
  ), 'hex') then raise exception 'internal_paper_worker_payload_corrupt'; end if;

  if v_job.work_kind = 'entry' then
    select to_jsonb(effect) into v_effect
    from public.app_apply_internal_paper_entry_v1(
      (v_job.payload ->> 'owner_user_id')::uuid,
      (v_job.payload ->> 'account_id')::uuid,
      v_job.payload ->> 'scan_run_id',
      v_job.payload ->> 'scan_run_fingerprint',
      v_job.payload ->> 'snapshot_id',
      v_job.payload ->> 'snapshot_fingerprint',
      v_job.payload ->> 'candidate_identity',
      v_job.payload ->> 'strategy_id',
      v_job.payload ->> 'strategy_version',
      v_job.payload ->> 'strategy_rollback_identity',
      v_job.payload ->> 'symbol_selection_policy_id',
      v_job.payload ->> 'symbol_selection_policy_version',
      v_job.payload ->> 'observed_universe_version',
      v_job.payload ->> 'ticker',
      (v_job.payload ->> 'quantity')::bigint,
      (v_job.payload ->> 'arrival_price')::numeric,
      (v_job.payload ->> 'stop_price')::numeric,
      (v_job.payload ->> 'target_price')::numeric,
      (v_job.payload ->> 'submitted_at')::timestamptz,
      v_job.payload ->> 'fill_model_version',
      v_job.payload ->> 'command_version'
    ) effect;
    if v_effect is null then raise exception 'internal_paper_worker_entry_missing_effect'; end if;
    v_terminal_status := 'completed';
  elsif v_job.work_kind = 'exit' then
    select to_jsonb(effect) into v_effect
    from public.app_apply_internal_paper_exit_v1(
      (v_job.payload ->> 'owner_user_id')::uuid,
      (v_job.payload ->> 'account_id')::uuid,
      (v_job.payload ->> 'position_id')::uuid,
      (v_job.payload ->> 'candle_id')::uuid,
      v_job.payload ->> 'fill_model_version',
      v_job.payload ->> 'evidence_version',
      v_job.payload ->> 'command_version'
    ) effect;
    if v_effect is null then raise exception 'internal_paper_worker_exit_missing_effect'; end if;
    v_terminal_status := 'completed';
  else
    select * into v_scan
    from public.recommendation_scan_runs
    where id = v_job.payload ->> 'scan_run_id'
      and owner_user_id = v_job.owner_user_id
      and run_fingerprint = v_job.payload ->> 'scan_run_fingerprint'
    for share;
    if not found
      or v_scan.payload_json #>> '{candidate_decision_record,record_version}'
        <> 'candidate_decision_record_v3'
      or v_scan.payload_json #>> '{candidate_decision_record,final_decision,disposition}'
        <> 'no_trade'
      or v_scan.payload_json #>> '{candidate_decision_record,scan_run_id}'
        <> v_job.payload ->> 'scan_run_id'
      or v_scan.payload_json #>> '{candidate_decision_record,scan_run_fingerprint}'
        <> v_job.payload ->> 'scan_run_fingerprint'
      or v_scan.payload_json #>> '{candidate_decision_record,final_decision,no_trade_reason}'
        is distinct from v_job.payload ->> 'no_trade_reason'
    then raise exception 'internal_paper_worker_no_trade_not_reconstructable'; end if;
    v_effect := jsonb_build_object(
      'scan_run_id', v_scan.id,
      'scan_run_fingerprint', v_scan.run_fingerprint,
      'no_trade_reason', v_scan.payload_json #>>
        '{candidate_decision_record,final_decision,no_trade_reason}'
    );
    v_terminal_status := 'no_trade';
  end if;

  v_result := jsonb_build_object(
    'result_version', 'internal_paper_worker_result_v1',
    'job_id', v_job.id,
    'work_kind', v_job.work_kind,
    'terminal_status', v_terminal_status,
    'effect', v_effect
  );
  v_result_digest := encode(extensions.digest(
    convert_to(v_result::text, 'UTF8'), 'sha256'
  ), 'hex');

  update public.internal_paper_worker_jobs job
  set status = v_terminal_status,
      result = v_result,
      result_digest = v_result_digest,
      completed_at = p_now,
      lease_owner = null,
      lease_token = null,
      lease_expires_at = null,
      last_failure_code = null,
      updated_at = p_now
  where job.id = v_job.id;

  return v_result || jsonb_build_object('result_digest', v_result_digest);
end;
$$;

revoke all on function public.app_execute_internal_paper_worker_job_v1(
  uuid, uuid, timestamptz, text
) from public, anon, authenticated;
grant execute on function public.app_execute_internal_paper_worker_job_v1(
  uuid, uuid, timestamptz, text
) to service_role;

create function public.app_release_internal_paper_worker_job_v1(
  p_job_id uuid,
  p_lease_token uuid,
  p_now timestamptz,
  p_retry_at timestamptz,
  p_failure_code text,
  p_contract_version text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_job public.internal_paper_worker_jobs%rowtype;
  v_next_status text;
begin
  if p_contract_version <> 'internal_paper_worker_job_v1'
    or p_job_id is null or p_lease_token is null or p_now is null
    or p_retry_at is null or p_retry_at < p_now
    or p_failure_code is null or p_failure_code !~ '^[a-z0-9_]{1,80}$'
  then raise exception 'invalid_internal_paper_worker_release'; end if;

  select * into v_job
  from public.internal_paper_worker_jobs
  where id = p_job_id
  for update;
  if not found then raise exception 'internal_paper_worker_job_not_found'; end if;
  if v_job.contract_version <> p_contract_version
    or v_job.status <> 'leased'
    or v_job.lease_token <> p_lease_token
  then raise exception 'internal_paper_worker_lease_invalid'; end if;

  v_next_status := case
    when v_job.attempt_count >= v_job.max_attempts then 'blocked'
    else 'queued'
  end;
  update public.internal_paper_worker_jobs job
  set status = v_next_status,
      available_at = p_retry_at,
      lease_owner = null,
      lease_token = null,
      lease_expires_at = null,
      last_failure_code = p_failure_code,
      updated_at = p_now
  where job.id = v_job.id;

  return jsonb_build_object(
    'contract_version', p_contract_version,
    'job_id', v_job.id,
    'status', v_next_status,
    'attempt_count', v_job.attempt_count,
    'max_attempts', v_job.max_attempts,
    'failure_code', p_failure_code,
    'retry_at', case when v_next_status = 'queued' then p_retry_at else null end
  );
end;
$$;

revoke all on function public.app_release_internal_paper_worker_job_v1(
  uuid, uuid, timestamptz, timestamptz, text, text
) from public, anon, authenticated;
grant execute on function public.app_release_internal_paper_worker_job_v1(
  uuid, uuid, timestamptz, timestamptz, text, text
) to service_role;

create function public.app_read_internal_paper_worker_v1(
  p_owner_user_id uuid,
  p_account_id uuid,
  p_read_version text
)
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select jsonb_build_object(
    'read_version', 'internal_paper_worker_readback_v1',
    'owner_user_id', account.owner_user_id,
    'account_id', account.id,
    'account_status', account.status,
    'queued_count', count(*) filter (where job.status = 'queued'),
    'leased_count', count(*) filter (where job.status = 'leased'),
    'completed_count', count(*) filter (where job.status = 'completed'),
    'no_trade_count', count(*) filter (where job.status = 'no_trade'),
    'blocked_count', count(*) filter (where job.status = 'blocked'),
    'latest_job', (
      select jsonb_build_object(
        'job_id', latest.id,
        'work_kind', latest.work_kind,
        'status', latest.status,
        'attempt_count', latest.attempt_count,
        'max_attempts', latest.max_attempts,
        'last_failure_code', latest.last_failure_code,
        'result', latest.result,
        'created_at', latest.created_at,
        'updated_at', latest.updated_at,
        'completed_at', latest.completed_at
      )
      from public.internal_paper_worker_jobs latest
      where latest.account_id = account.id
        and latest.owner_user_id = account.owner_user_id
      order by latest.created_at desc, latest.id desc
      limit 1
    )
  )
  from public.internal_paper_accounts account
  left join public.internal_paper_worker_jobs job
    on job.account_id = account.id
    and job.owner_user_id = account.owner_user_id
  where account.id = p_account_id
    and account.owner_user_id = p_owner_user_id
    and p_read_version = 'internal_paper_worker_readback_v1'
  group by account.id, account.owner_user_id, account.status;
$$;

revoke all on function public.app_read_internal_paper_worker_v1(
  uuid, uuid, text
) from public, anon, authenticated;
grant execute on function public.app_read_internal_paper_worker_v1(
  uuid, uuid, text
) to service_role;

comment on table public.internal_paper_worker_jobs is
  'SV-C3 durable brokerless jobs with account-serial leases, bounded retries and atomic C1/C2 execution.';
comment on function public.app_execute_internal_paper_worker_job_v1(
  uuid, uuid, timestamptz, text
) is
  'SV-C3 executes one leased paper job and its C1/C2 economic effect in the same transaction; no provider or broker path.';
