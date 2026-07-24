do $$
declare
  legacy_issue_oid regprocedure := to_regprocedure(
    'public.issue_continuous_intelligence_shadow_canary_manual_authorizatio(text,text,timestamp with time zone,timestamp with time zone,text,text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,smallint,smallint,smallint,smallint,text,text,text,text,text)'
  );
  canonical_issue_oid regprocedure := to_regprocedure(
    'public.ci_mca_issue(text,text,timestamp with time zone,timestamp with time zone,text,text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,smallint,smallint,smallint,smallint,text,text,text,text,text)'
  );
  legacy_consume_oid regprocedure := to_regprocedure(
    'public.consume_continuous_intelligence_shadow_canary_manual_authorizat(text,text,text,text,text)'
  );
  canonical_consume_oid regprocedure := to_regprocedure(
    'public.ci_mca_consume(text,text,text,text,text)'
  );
  legacy_readiness_oid regprocedure := to_regprocedure(
    'public.read_continuous_intelligence_shadow_canary_manual_issuance_read()'
  );
  canonical_readiness_oid regprocedure := to_regprocedure('public.ci_mca_readiness()');
begin
  if legacy_issue_oid is not null and canonical_issue_oid is not null and legacy_issue_oid <> canonical_issue_oid then
    raise exception 'ambiguous manual authorization issue RPC catalog identity';
  elsif legacy_issue_oid is not null then
    execute format('alter function %s rename to %I', legacy_issue_oid::text, 'ci_mca_issue');
  elsif canonical_issue_oid is null then
    raise exception 'manual authorization issue RPC is missing';
  end if;

  if legacy_consume_oid is not null and canonical_consume_oid is not null and legacy_consume_oid <> canonical_consume_oid then
    raise exception 'ambiguous manual authorization consume RPC catalog identity';
  elsif legacy_consume_oid is not null then
    execute format('alter function %s rename to %I', legacy_consume_oid::text, 'ci_mca_consume');
  elsif canonical_consume_oid is null then
    raise exception 'manual authorization consume RPC is missing';
  end if;

  if legacy_readiness_oid is not null and canonical_readiness_oid is not null and legacy_readiness_oid <> canonical_readiness_oid then
    raise exception 'ambiguous manual authorization readiness RPC catalog identity';
  elsif legacy_readiness_oid is not null then
    execute format('alter function %s rename to %I', legacy_readiness_oid::text, 'ci_mca_readiness');
  elsif canonical_readiness_oid is null then
    raise exception 'manual authorization readiness RPC is missing';
  end if;
end;
$$;

create or replace function public.ci_mca_readiness()
returns table (
  authorization_table_available boolean,
  lease_table_available boolean,
  authorization_table_rls_enabled boolean,
  lease_table_rls_enabled boolean,
  authorization_issue_rpc_available boolean,
  authorization_issue_rpc_signature_valid boolean,
  authorization_issue_rpc_service_role_executable boolean,
  authorization_issue_rpc_public_executable boolean,
  authorization_issue_rpc_anon_executable boolean,
  authorization_issue_rpc_authenticated_executable boolean,
  lease_issue_rpc_available boolean,
  lease_issue_rpc_signature_valid boolean,
  lease_issue_rpc_service_role_executable boolean,
  lease_issue_rpc_public_executable boolean,
  lease_issue_rpc_anon_executable boolean,
  lease_issue_rpc_authenticated_executable boolean,
  transaction_prerequisites_valid boolean,
  active_issued_authorization_count integer,
  active_issued_lease_count integer
)
language sql
security invoker
set search_path = public, pg_catalog
as $$
  with functions as (
    select
      to_regprocedure('public.ci_mca_issue(text,text,timestamp with time zone,timestamp with time zone,text,text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,smallint,smallint,smallint,smallint,text,text,text,text,text)') as authorization_issue_oid,
      to_regprocedure('public.issue_ci_shadow_canary_manual_lease(text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,smallint,smallint,smallint,smallint,text,text,text,text,text)') as lease_issue_oid
  ),
  permissions as (
    select
      target.kind,
      target.procedure_oid,
      exists (
        select 1 from pg_proc procedure_record
        cross join lateral aclexplode(coalesce(procedure_record.proacl, acldefault('f', procedure_record.proowner))) privilege
        where procedure_record.oid = target.procedure_oid and privilege.grantee = to_regrole('service_role') and privilege.privilege_type = 'EXECUTE'
      ) as service_role_executable,
      exists (
        select 1 from pg_proc procedure_record
        cross join lateral aclexplode(coalesce(procedure_record.proacl, acldefault('f', procedure_record.proowner))) privilege
        where procedure_record.oid = target.procedure_oid and privilege.grantee = 0 and privilege.privilege_type = 'EXECUTE'
      ) as public_executable,
      exists (
        select 1 from pg_proc procedure_record
        cross join lateral aclexplode(coalesce(procedure_record.proacl, acldefault('f', procedure_record.proowner))) privilege
        where procedure_record.oid = target.procedure_oid and privilege.grantee = to_regrole('anon') and privilege.privilege_type = 'EXECUTE'
      ) as anon_executable,
      exists (
        select 1 from pg_proc procedure_record
        cross join lateral aclexplode(coalesce(procedure_record.proacl, acldefault('f', procedure_record.proowner))) privilege
        where procedure_record.oid = target.procedure_oid and privilege.grantee = to_regrole('authenticated') and privilege.privilege_type = 'EXECUTE'
      ) as authenticated_executable
    from functions
    cross join lateral (
      values ('authorization'::text, functions.authorization_issue_oid), ('lease'::text, functions.lease_issue_oid)
    ) as target(kind, procedure_oid)
  ),
  facts as (
    select
      to_regclass('public.continuous_intelligence_shadow_canary_manual_authorizations') as authorization_table,
      to_regclass('public.continuous_intelligence_shadow_canary_manual_execution_leases') as lease_table
  )
  select
    facts.authorization_table is not null,
    facts.lease_table is not null,
    coalesce((select relrowsecurity from pg_class where oid = facts.authorization_table), false),
    coalesce((select relrowsecurity from pg_class where oid = facts.lease_table), false),
    (select procedure_oid is not null from permissions where kind = 'authorization'),
    (select procedure_oid is not null and pg_get_function_identity_arguments(procedure_oid) = 'p_authorization_id text, p_token_hash text, p_issued_at timestamp with time zone, p_expires_at timestamp with time zone, p_request_fingerprint text, p_execution_id text, p_claim_id text, p_ticker text, p_interval text, p_requested_start timestamp with time zone, p_requested_end timestamp with time zone, p_calendar_contract_version text, p_calendar_fingerprint text, p_budget_policy_version text, p_policy_total_credits smallint, p_policy_hard_reserve_credits smallint, p_policy_normal_planned_max_credits smallint, p_estimated_credits smallint, p_canary_contract_version text, p_claim_contract_version text, p_deployment_commit text, p_deployment_build_marker text, p_purpose text' from permissions where kind = 'authorization'),
    coalesce((select service_role_executable from permissions where kind = 'authorization'), false),
    coalesce((select public_executable from permissions where kind = 'authorization'), false),
    coalesce((select anon_executable from permissions where kind = 'authorization'), false),
    coalesce((select authenticated_executable from permissions where kind = 'authorization'), false),
    (select procedure_oid is not null from permissions where kind = 'lease'),
    (select procedure_oid is not null and pg_get_function_identity_arguments(procedure_oid) = 'p_authorization_id text, p_execution_lease_id text, p_token_hash text, p_issued_at timestamp with time zone, p_expires_at timestamp with time zone, p_request_fingerprint text, p_execution_id text, p_claim_id text, p_ticker text, p_interval text, p_requested_start timestamp with time zone, p_requested_end timestamp with time zone, p_calendar_contract_version text, p_calendar_fingerprint text, p_budget_policy_version text, p_policy_total_credits smallint, p_policy_hard_reserve_credits smallint, p_policy_normal_planned_max_credits smallint, p_estimated_credits smallint, p_canary_contract_version text, p_claim_contract_version text, p_deployment_commit text, p_deployment_build_marker text, p_purpose text' from permissions where kind = 'lease'),
    coalesce((select service_role_executable from permissions where kind = 'lease'), false),
    coalesce((select public_executable from permissions where kind = 'lease'), false),
    coalesce((select anon_executable from permissions where kind = 'lease'), false),
    coalesce((select authenticated_executable from permissions where kind = 'lease'), false),
    facts.authorization_table is not null and facts.lease_table is not null and
      exists (select 1 from pg_constraint where conrelid = facts.lease_table and contype = 'f' and confrelid = facts.authorization_table) and
      exists (select 1 from pg_constraint where conrelid = facts.lease_table and contype = 'u' and pg_get_constraintdef(oid) like '%authorization_id%'),
    (select count(*)::integer from public.continuous_intelligence_shadow_canary_manual_authorizations where status = 'issued' and expires_at > now()),
    (select count(*)::integer from public.continuous_intelligence_shadow_canary_manual_execution_leases where status = 'issued' and expires_at > now())
  from facts;
$$;

revoke all on function public.ci_mca_issue(text, text, timestamptz, timestamptz, text, text, text, text, text, timestamptz, timestamptz, text, text, text, smallint, smallint, smallint, smallint, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.ci_mca_consume(text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.ci_mca_readiness() from public, anon, authenticated;
grant execute on function public.ci_mca_issue(text, text, timestamptz, timestamptz, text, text, text, text, text, timestamptz, timestamptz, text, text, text, smallint, smallint, smallint, smallint, text, text, text, text, text) to service_role;
grant execute on function public.ci_mca_consume(text, text, text, text, text) to service_role;
grant execute on function public.ci_mca_readiness() to service_role;

comment on function public.ci_mca_readiness() is
  'Action 590 read-only manual issuance readiness probe. Its short stable catalog name is safe for PostgREST and it performs no data-modifying statement.';

notify pgrst, 'reload schema';
