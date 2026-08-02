-- Action 661J: normal, forward-only containment for server-owned intelligence data.
-- This migration intentionally does not create, alter, or delete application data.
begin;

select pg_advisory_xact_lock(66120260726000000);

do $action_661j$
declare
  target_tables text[] := array[
    'bounded_shadow_collector_proof_audits',
    'continuous_intelligence_credit_ledger',
    'continuous_intelligence_shadow_canary_daily_claims',
    'continuous_intelligence_shadow_canary_manual_authorizations',
    'historical_candle_fetch_runs',
    'historical_candles'
  ];
  target_name text;
  target_oid regclass;
  rpc_signatures text[] := array[
    'public.claim_continuous_intelligence_shadow_canary(text,text,text,date,smallint)',
    'public.begin_continuous_intelligence_shadow_canary_attempt(text,text,text,text)',
    'public.finalize_continuous_intelligence_shadow_canary_attempt(text,text,text,text,text,boolean,text,timestamp with time zone)',
    'public.ci_mca_issue(text,text,timestamp with time zone,timestamp with time zone,text,text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,smallint,smallint,smallint,smallint,text,text,text,text,text)',
    'public.ci_mca_consume(text,text,text,text,text)',
    'public.admit_continuous_intelligence_shadow_canary_manual_execution(text,text,text,text,text,date)',
    'public.issue_ci_shadow_canary_manual_lease(text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,smallint,smallint,smallint,smallint,text,text,text,text,text)',
    'public.admit_ci_shadow_canary_manual_lease(text,text,text,text,text,text,date)'
  ];
  rpc_body_hashes text[] := array[
    'b559bf5e2446087019ed5e0ea4eae1a54b4853df9c41ea440ecabc2d5ff7a62c',
    'd63cea7527f9b1d7b3bd0a70d1807608d231b150a6179901bf011b32da88eafd',
    '14a4879683d01ca2d8a2ab0e0b03b2662e9e50ad325f049f7b8b32f8dd36ea2d',
    'cc2b04122d148203c9d2c2011083aaecd76d43c425d42d4e2fd0f33bf3c9dfee',
    'e90a0745f4c26c39dc14f2566af01e21502a8284badf715cb19a231003d3e2f3',
    'ea43402aaf1b5d8b116bd27dcbf4c7e69c94966a4d9868c3786e5ad90dc481b1',
    '18a84ef2254cf2d9d46f976a52e5c6b9aac7998ea76a4c6c7180ec0ba76ef5dd',
    '47a4594c67c9a78cea123ac2bd74a63932343cbc506bf6b2c5ad5683bc3a981c'
  ];
  rpc_signature text;
  rpc_oid regprocedure;
  rpc_index integer;
  canonical_append_only regprocedure := to_regprocedure('public.action_650_reject_execution_audit_mutation()');
begin
  if not exists (
    select 1 from supabase_migrations.schema_migrations
    where version = '20260724002000'
      and name = 'contain_production_trading_data_access'
      and cardinality(statements) = 6
  ) then
    raise exception 'Action 661J requires exact Action 650 history';
  end if;
  if exists (select 1 from supabase_migrations.schema_migrations where version in ('20260724003000', '20260726000000')) then
    raise exception 'Action 661J refuses incident or duplicate containment history';
  end if;
  if exists (select 1 from supabase_migrations.schema_migrations where version in ('20260708000000', '20260708001000', '20260710000000')) then
    raise exception 'Action 661J refuses forbidden migration history';
  end if;

  foreach target_name in array target_tables loop
    target_oid := format('public.%I', target_name)::regclass;
    if target_oid is null
       or (select relkind from pg_class where oid = target_oid) <> 'r'
       or (select pg_get_userbyid(relowner) from pg_class where oid = target_oid) <> 'postgres' then
      raise exception 'Action 661J unexpected target relation state for %', target_name;
    end if;
    if exists (
      select 1 from pg_class classes
      cross join lateral aclexplode(coalesce(classes.relacl, acldefault('r', classes.relowner))) acl
      where classes.oid = target_oid
        and acl.grantee <> 0
        and acl.grantee <> classes.relowner
        and acl.grantee not in (select oid from pg_roles where rolname in ('anon', 'authenticated', 'service_role'))
    ) or exists (
      select 1 from pg_attribute attributes
      cross join lateral aclexplode(attributes.attacl) acl
      where attributes.attrelid = target_oid and attributes.attnum > 0 and not attributes.attisdropped
    ) then
      raise exception 'Action 661J refuses unknown or column ACL state for %', target_name;
    end if;
    if exists (select 1 from pg_policies where schemaname = 'public' and tablename = target_name) then
      raise exception 'Action 661J refuses policy state for %', target_name;
    end if;
  end loop;

  -- Verify every immutable body and catalog field before changing even one RPC.
  -- pg_proc.prosrc is hashed byte-for-byte: no whitespace normalization can hide
  -- executable or string-literal drift.
  for rpc_index in 1..cardinality(rpc_signatures) loop
    rpc_signature := rpc_signatures[rpc_index];
    rpc_oid := to_regprocedure(rpc_signature);
    if rpc_oid is null
       or (select nspname from pg_proc join pg_namespace on pg_namespace.oid = pg_proc.pronamespace where pg_proc.oid = rpc_oid) <> 'public'
       or (select pg_get_userbyid(proowner) from pg_proc where oid = rpc_oid) <> 'postgres'
       or (select lanname from pg_proc join pg_language on pg_language.oid = pg_proc.prolang where pg_proc.oid = rpc_oid) <> 'plpgsql'
       or (select prokind from pg_proc where oid = rpc_oid) <> 'f'
       or (select prorettype from pg_proc where oid = rpc_oid) <> 'record'::regtype
       or (select prosecdef from pg_proc where oid = rpc_oid)
       or (select provolatile from pg_proc where oid = rpc_oid) <> 'v'
       or (select proisstrict from pg_proc where oid = rpc_oid)
       or (select proparallel from pg_proc where oid = rpc_oid) <> 'u'
       or coalesce((select array_to_string(proconfig, ',') from pg_proc where oid = rpc_oid), '') not in ('search_path=public', 'search_path=public, extensions')
       or encode(digest((select prosrc from pg_proc where oid = rpc_oid), 'sha256'), 'hex') <> rpc_body_hashes[rpc_index]
       or (select count(*) from pg_proc where pronamespace = 'public'::regnamespace and proname = (select proname from pg_proc where oid = rpc_oid)) <> 1
       or has_function_privilege('public', rpc_oid, 'execute')
       or has_function_privilege('anon', rpc_oid, 'execute')
       or has_function_privilege('authenticated', rpc_oid, 'execute')
       or not has_function_privilege('service_role', rpc_oid, 'execute') then
      raise exception 'Action 661J refuses RPC catalog/body drift: %', rpc_signature;
    end if;
  end loop;

  if canonical_append_only is null
     or (select pg_get_userbyid(proowner) from pg_proc where oid = canonical_append_only) <> 'postgres'
     or (select prolang from pg_proc where oid = canonical_append_only) <> (select oid from pg_language where lanname = 'plpgsql')
     or (select prosecdef from pg_proc where oid = canonical_append_only)
     or (select proconfig from pg_proc where oid = canonical_append_only) <> array['search_path=pg_catalog'] then
    raise exception 'Action 661J refuses incompatible canonical append-only function';
  end if;
  if exists (
    select 1 from pg_trigger triggers
    where triggers.tgrelid = 'public.bounded_shadow_collector_proof_audits'::regclass
      and not triggers.tgisinternal
  ) then
    raise exception 'Action 661J refuses pre-existing proof-audit trigger state';
  end if;

  -- Harden the verified functions before direct table privileges are narrowed.
  foreach rpc_signature in array rpc_signatures loop
    execute format('alter function %s security definer', rpc_signature);
    execute format('alter function %s set search_path = pg_catalog, public, extensions', rpc_signature);
    execute format('revoke all on function %s from public, anon, authenticated', rpc_signature);
    execute format('grant execute on function %s to service_role', rpc_signature);
  end loop;

  for rpc_index in 1..cardinality(rpc_signatures) loop
    rpc_oid := to_regprocedure(rpc_signatures[rpc_index]);
    if not (select prosecdef from pg_proc where oid = rpc_oid)
       or (select pg_get_userbyid(proowner) from pg_proc where oid = rpc_oid) <> 'postgres'
       or coalesce((select array_to_string(proconfig, ',') from pg_proc where oid = rpc_oid), '') <> 'search_path=pg_catalog, public, extensions'
       or encode(digest((select prosrc from pg_proc where oid = rpc_oid), 'sha256'), 'hex') <> rpc_body_hashes[rpc_index]
       or has_function_privilege('public', rpc_oid, 'execute')
       or has_function_privilege('anon', rpc_oid, 'execute')
       or has_function_privilege('authenticated', rpc_oid, 'execute')
       or not has_function_privilege('service_role', rpc_oid, 'execute') then
      raise exception 'Action 661J RPC hardening postcondition failed: %', rpc_signatures[rpc_index];
    end if;
  end loop;

  foreach target_name in array target_tables loop
    execute format('revoke all on table public.%I from public, anon, authenticated, service_role', target_name);
    execute format('alter table public.%I enable row level security', target_name);
  end loop;
  grant select, insert on public.bounded_shadow_collector_proof_audits to service_role;
  grant select, insert, update on public.continuous_intelligence_credit_ledger to service_role;
  grant select on public.continuous_intelligence_shadow_canary_daily_claims to service_role;
  grant select on public.continuous_intelligence_shadow_canary_manual_authorizations to service_role;
  grant select, insert on public.historical_candle_fetch_runs to service_role;
  grant select, insert, update on public.historical_candles to service_role;
  create trigger action_661j_proof_audit_append_only
    before update or delete on public.bounded_shadow_collector_proof_audits
    for each row execute function public.action_650_reject_execution_audit_mutation();

  foreach target_name in array target_tables loop
    target_oid := format('public.%I', target_name)::regclass;
    if not (select relrowsecurity from pg_class where oid = target_oid)
       or exists (select 1 from pg_policies where schemaname = 'public' and tablename = target_name)
       or exists (select 1 from pg_attribute attributes where attributes.attrelid = target_oid and attributes.attnum > 0 and not attributes.attisdropped and attributes.attacl is not null) then
      raise exception 'Action 661J postcondition failed for %', target_name;
    end if;
  end loop;
  if not exists (
    select 1 from pg_trigger where tgrelid = 'public.bounded_shadow_collector_proof_audits'::regclass
      and tgname = 'action_661j_proof_audit_append_only' and not tgisinternal
      and tgfoid = canonical_append_only and tgenabled = 'O' and tgtype = 27
  ) then
    raise exception 'Action 661J proof-audit trigger postcondition failed';
  end if;
end;
$action_661j$;

commit;
