import {
  DOMAIN_IDS,
  REASON_CODES,
  TARGET_RELATIONS,
  buildSnapshotV2Rebuild,
  canonicalJson,
  deepFreeze,
} from "./action-661j5r2-runtime-contracts-rebuild-v1.mjs";

export const RUNTIME_COLLECTOR_VERSION =
  "action_661j5r8_postgres_runtime_collector_rebuild_v3";
export const RUNTIME_COLLECTOR_PATH =
  "lib/action-661j5r8-postgres-runtime-collector-rebuild-v3.mjs";

const expectedValues = TARGET_RELATIONS.map((relation) => {
  const [namespace, name] = relation.split(".");
  return `('${namespace}','${name}')`;
}).join(",");

export const METADATA_DISCOVERY_SQL = `
with expected(namespace_name, relation_name) as (values ${expectedValues})
select coalesce(jsonb_agg(jsonb_build_object(
  'relation', expected.namespace_name || '.' || expected.relation_name,
  'relation_state', case
    when classes.oid is null then 'missing'
    when classes.relkind <> 'r' then 'non_table'
    when pg_get_userbyid(classes.relowner) <> 'postgres' then 'wrong_owner'
    else 'present_table'
  end,
  'observed', case when classes.oid is null then null else jsonb_build_object(
    'oid', classes.oid::integer,
    'owner', pg_get_userbyid(classes.relowner),
    'relkind', classes.relkind::text
  ) end
) order by expected.namespace_name, expected.relation_name), '[]'::jsonb)
from expected
left join pg_namespace namespaces
  on namespaces.nspname = expected.namespace_name
left join pg_class classes
  on classes.relnamespace = namespaces.oid
 and classes.relname = expected.relation_name;
`.trim();

export const OTHER_DOMAINS_SQL = `
select jsonb_build_object(
  'schema_relations', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'namespace', namespaces.nspname,
      'relation', classes.relname,
      'relkind', classes.relkind::text,
      'owner', pg_get_userbyid(classes.relowner),
      'rls_enabled', classes.relrowsecurity
    ) order by namespaces.nspname, classes.relname), '[]'::jsonb)
    from pg_class classes
    join pg_namespace namespaces on namespaces.oid = classes.relnamespace
    where namespaces.nspname = 'public'
      and classes.relkind in ('r','p','v','m','S','f')
  ),
  'migration_history', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'version', version,
      'name', name,
      'statement_count', cardinality(statements)
    ) order by version), '[]'::jsonb)
    from supabase_migrations.schema_migrations
  ),
  'rls_policies', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'schema', schemaname,
      'table', tablename,
      'name', policyname,
      'permissive', permissive,
      'roles', roles,
      'command', cmd,
      'using', qual,
      'with_check', with_check
    ) order by schemaname, tablename, policyname), '[]'::jsonb)
    from pg_policies
    where schemaname = 'public'
  ),
  'table_acl', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'relation', namespaces.nspname || '.' || classes.relname,
      'grantee', coalesce(roles.rolname, 'public'),
      'grantor', grantors.rolname,
      'privilege', acl.privilege_type,
      'grantable', acl.is_grantable
    ) order by namespaces.nspname, classes.relname, coalesce(roles.rolname, 'public'),
      acl.privilege_type), '[]'::jsonb)
    from pg_class classes
    join pg_namespace namespaces on namespaces.oid = classes.relnamespace
    cross join lateral aclexplode(classes.relacl) acl
    left join pg_roles roles on roles.oid = acl.grantee
    join pg_roles grantors on grantors.oid = acl.grantor
    where namespaces.nspname = 'public' and classes.relkind in ('r','p','v','m','f')
  ),
  'column_acl', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'relation', namespaces.nspname || '.' || classes.relname,
      'column', attributes.attname,
      'attnum', attributes.attnum,
      'grantee', coalesce(roles.rolname, 'public'),
      'grantor', grantors.rolname,
      'privilege', acl.privilege_type,
      'grantable', acl.is_grantable
    ) order by namespaces.nspname, classes.relname, attributes.attname,
      attributes.attnum, coalesce(roles.rolname, 'public'), grantors.rolname,
      acl.privilege_type, acl.is_grantable), '[]'::jsonb)
    from pg_attribute attributes
    join pg_class classes on classes.oid = attributes.attrelid
    join pg_namespace namespaces on namespaces.oid = classes.relnamespace
    cross join lateral aclexplode(attributes.attacl) acl
    left join pg_roles roles on roles.oid = acl.grantee
    join pg_roles grantors on grantors.oid = acl.grantor
    where namespaces.nspname = 'public'
      and attributes.attnum > 0
      and not attributes.attisdropped
  ),
  'rpc_catalog', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'identity', procedures.oid::regprocedure::text,
      'owner', pg_get_userbyid(procedures.proowner),
      'language', languages.lanname,
      'kind', procedures.prokind,
      'return_type', procedures.prorettype::regtype::text,
      'security_definer', procedures.prosecdef,
      'volatility', procedures.provolatile,
      'strict', procedures.proisstrict,
      'parallel', procedures.proparallel,
      'proconfig', procedures.proconfig,
      'body_sha256', encode(digest(procedures.prosrc, 'sha256'), 'hex'),
      'overload_count', (
        select count(*)::integer
        from pg_proc overloads
        where overloads.pronamespace = procedures.pronamespace
          and overloads.proname = procedures.proname
      ),
      'role_privileges', jsonb_build_object(
        'public_execute', has_function_privilege('public', procedures.oid, 'execute'),
        'anon_execute', has_function_privilege('anon', procedures.oid, 'execute'),
        'authenticated_execute', has_function_privilege('authenticated', procedures.oid, 'execute'),
        'service_role_execute', has_function_privilege('service_role', procedures.oid, 'execute')
      )
    ) order by procedures.oid::regprocedure::text), '[]'::jsonb)
    from pg_proc procedures
    join pg_namespace namespaces on namespaces.oid = procedures.pronamespace
    join pg_language languages on languages.oid = procedures.prolang
    where namespaces.nspname = 'public'
  ),
  'function_catalog', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'identity', procedures.oid::regprocedure::text,
      'source', procedures.prosrc
    ) order by procedures.oid::regprocedure::text), '[]'::jsonb)
    from pg_proc procedures
    join pg_namespace namespaces on namespaces.oid = procedures.pronamespace
    where namespaces.nspname = 'public'
  ),
  'trigger_catalog', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'relation', namespaces.nspname || '.' || classes.relname,
      'name', triggers.tgname,
      'function', triggers.tgfoid::regprocedure::text,
      'enabled', triggers.tgenabled,
      'type', triggers.tgtype
    ) order by namespaces.nspname, classes.relname, triggers.tgname), '[]'::jsonb)
    from pg_trigger triggers
    join pg_class classes on classes.oid = triggers.tgrelid
    join pg_namespace namespaces on namespaces.oid = classes.relnamespace
    where namespaces.nspname = 'public' and not triggers.tgisinternal
  )
);
`.trim();

function fail(detail) {
  throw new Error(`${REASON_CODES.snapshot_metadata}:${detail}`);
}

function guardedReadSql(relation, oid) {
  if (!TARGET_RELATIONS.includes(relation) || !Number.isInteger(oid)) {
    fail("guarded_read_authority");
  }
  const [namespace, name] = relation.split(".");
  return `
select jsonb_build_object(
  'relation', '${relation}',
  'oid', ${oid},
  'rows', coalesce((
    select jsonb_agg(to_jsonb(source) order by to_jsonb(source)::text)
    from "${namespace}"."${name}" source
  ), '[]'::jsonb)
);
`.trim();
}

export function collectRuntimeSnapshotRebuildV1({ query_json }) {
  if (typeof query_json !== "function") fail("query_boundary");
  const metadata = query_json(METADATA_DISCOVERY_SQL);
  if (!Array.isArray(metadata)) fail("metadata_result");
  const guardedReads = [];
  for (const entry of metadata) {
    if (
      entry === null ||
      typeof entry !== "object" ||
      Array.isArray(entry) ||
      !TARGET_RELATIONS.includes(entry.relation)
    ) {
      fail("metadata_entry");
    }
    if (entry.relation_state === "present_table") {
      guardedReads.push(
        query_json(guardedReadSql(entry.relation, entry.observed?.oid)),
      );
    }
  }
  const domains = query_json(OTHER_DOMAINS_SQL);
  if (
    domains === null ||
    typeof domains !== "object" ||
    Array.isArray(domains)
  ) {
    fail("domains_result");
  }
  const completeDomains = { ...domains, target_data: null };
  if (
    canonicalJson(Object.keys(completeDomains).sort()) !==
    canonicalJson([...DOMAIN_IDS].sort())
  ) {
    fail("domains_inventory");
  }
  return deepFreeze({
    guarded_reads: guardedReads
      .map((read) => structuredClone(read))
      .sort((left, right) => left.relation.localeCompare(right.relation)),
    snapshot: buildSnapshotV2Rebuild({
      domains: completeDomains,
      guarded_data_reads: guardedReads,
      metadata_discovery: metadata,
    }),
  });
}
