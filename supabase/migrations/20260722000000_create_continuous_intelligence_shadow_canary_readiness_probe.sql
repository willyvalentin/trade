create or replace function public.read_continuous_intelligence_shadow_canary_readiness()
returns table (
  probe_contract_version text,
  audit_table_available boolean,
  ledger_table_available boolean,
  claim_table_available boolean,
  claim_rpc_available boolean,
  begin_attempt_rpc_available boolean,
  finalize_attempt_rpc_available boolean,
  lifecycle_rpcs_public_executable boolean,
  lifecycle_rpcs_anon_executable boolean,
  lifecycle_rpcs_authenticated_executable boolean,
  lifecycle_rpcs_service_role_executable boolean,
  audit_canary_entry_kind_constrained boolean,
  audit_no_effect_constraint_available boolean,
  ledger_canary_entry_kind_constrained boolean,
  ledger_zero_reserve_constraint_available boolean,
  claim_status_constraint_available boolean
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  with lifecycle_targets(name, procedure_oid) as (
    values
      ('claim', to_regprocedure('public.claim_continuous_intelligence_shadow_canary(text,text,text,date,smallint)')),
      ('begin_attempt', to_regprocedure('public.begin_continuous_intelligence_shadow_canary_attempt(text,text,text,text)')),
      ('finalize_attempt', to_regprocedure('public.finalize_continuous_intelligence_shadow_canary_attempt(text,text,text,text,text,boolean,text,timestamp with time zone)'))
  ), lifecycle_permissions as (
    select
      target.name,
      target.procedure_oid,
      exists (
        select 1
        from pg_proc proc
        cross join lateral aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) privilege
        where proc.oid = target.procedure_oid
          and privilege.grantee = 0
          and privilege.privilege_type = 'EXECUTE'
      ) as public_executable,
      exists (
        select 1
        from pg_proc proc
        cross join lateral aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) privilege
        where proc.oid = target.procedure_oid
          and privilege.grantee = to_regrole('anon')
          and privilege.privilege_type = 'EXECUTE'
      ) as anon_executable,
      exists (
        select 1
        from pg_proc proc
        cross join lateral aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) privilege
        where proc.oid = target.procedure_oid
          and privilege.grantee = to_regrole('authenticated')
          and privilege.privilege_type = 'EXECUTE'
      ) as authenticated_executable,
      exists (
        select 1
        from pg_proc proc
        cross join lateral aclexplode(coalesce(proc.proacl, acldefault('f', proc.proowner))) privilege
        where proc.oid = target.procedure_oid
          and privilege.grantee = to_regrole('service_role')
          and privilege.privilege_type = 'EXECUTE'
      ) as service_role_executable
    from lifecycle_targets target
  )
  select
    'continuous_intelligence_shadow_canary_readiness_probe_v1'::text,
    to_regclass('public.bounded_shadow_collector_proof_audits') is not null,
    to_regclass('public.continuous_intelligence_credit_ledger') is not null,
    to_regclass('public.continuous_intelligence_shadow_canary_daily_claims') is not null,
    (select procedure_oid is not null from lifecycle_targets where name = 'claim'),
    (select procedure_oid is not null from lifecycle_targets where name = 'begin_attempt'),
    (select procedure_oid is not null from lifecycle_targets where name = 'finalize_attempt'),
    coalesce((select bool_or(public_executable) from lifecycle_permissions), false),
    coalesce((select bool_or(anon_executable) from lifecycle_permissions), false),
    coalesce((select bool_or(authenticated_executable) from lifecycle_permissions), false),
    coalesce((select bool_and(procedure_oid is not null and service_role_executable) from lifecycle_permissions), false),
    exists (
      select 1 from pg_constraint constraint_record
      where constraint_record.conrelid = to_regclass('public.bounded_shadow_collector_proof_audits')
        and pg_get_constraintdef(constraint_record.oid) like '%scheduled_shadow_collector_canary%'
    ),
    exists (
      select 1 from pg_constraint constraint_record
      where constraint_record.conrelid = to_regclass('public.bounded_shadow_collector_proof_audits')
        and pg_get_constraintdef(constraint_record.oid) like '%supabase_writes_executed = false%'
    ),
    exists (
      select 1 from pg_constraint constraint_record
      where constraint_record.conrelid = to_regclass('public.continuous_intelligence_credit_ledger')
        and pg_get_constraintdef(constraint_record.oid) like '%scheduled_shadow_collector_canary%'
    ),
    exists (
      select 1 from pg_constraint constraint_record
      where constraint_record.conrelid = to_regclass('public.continuous_intelligence_credit_ledger')
        and pg_get_constraintdef(constraint_record.oid) like '%reserve_credits_charged = 0%'
    ),
    exists (
      select 1 from pg_constraint constraint_record
      where constraint_record.conrelid = to_regclass('public.continuous_intelligence_shadow_canary_daily_claims')
        and pg_get_constraintdef(constraint_record.oid) like '%claimed%'
        and pg_get_constraintdef(constraint_record.oid) like '%attempted%'
        and pg_get_constraintdef(constraint_record.oid) like '%completed%'
        and pg_get_constraintdef(constraint_record.oid) like '%failed%'
    );
$$;

revoke all on function public.read_continuous_intelligence_shadow_canary_readiness() from public, anon, authenticated;
grant execute on function public.read_continuous_intelligence_shadow_canary_readiness() to service_role;

comment on function public.read_continuous_intelligence_shadow_canary_readiness() is
  'Fixed, read-only Action 575 readiness probe. Returns bounded booleans only and never invokes lifecycle RPCs or mutates data.';
