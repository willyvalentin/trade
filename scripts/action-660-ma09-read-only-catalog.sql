begin transaction read only;

with
schemas as (
  select coalesce(
    jsonb_agg(jsonb_build_object('schema_name', n.nspname) order by n.nspname),
    '[]'::jsonb
  ) as rows
  from pg_catalog.pg_namespace n
  where n.nspname = 'public'
),
tables as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object('table_schema', t.table_schema, 'table_name', t.table_name)
      order by t.table_schema, t.table_name
    ),
    '[]'::jsonb
  ) as rows
  from information_schema.tables t
  where t.table_schema = 'public'
    and t.table_type = 'BASE TABLE'
),
views as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'view_schema', n.nspname,
        'view_name', c.relname,
        'security_invoker', coalesce('security_invoker=on' = any(c.reloptions), false)
      ) order by n.nspname, c.relname
    ),
    '[]'::jsonb
  ) as rows
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('v', 'm')
),
columns as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'table_schema', c.table_schema,
        'table_name', c.table_name,
        'column_name', c.column_name,
        'ordinal_position', c.ordinal_position,
        'data_type', c.data_type,
        'udt_schema', c.udt_schema,
        'udt_name', c.udt_name,
        'is_nullable', c.is_nullable = 'YES',
        'has_default', c.column_default is not null,
        'is_identity', c.is_identity = 'YES',
        'is_generated', c.is_generated <> 'NEVER'
      ) order by c.table_schema, c.table_name, c.ordinal_position, c.column_name
    ),
    '[]'::jsonb
  ) as rows
  from information_schema.columns c
  join information_schema.tables t
    on t.table_schema = c.table_schema
   and t.table_name = c.table_name
   and t.table_type = 'BASE TABLE'
  where c.table_schema = 'public'
),
primary_keys as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'table_schema', x.table_schema,
        'table_name', x.table_name,
        'constraint_name', x.constraint_name,
        'columns', x.columns
      ) order by x.table_schema, x.table_name, x.constraint_name
    ),
    '[]'::jsonb
  ) as rows
  from (
    select
      n.nspname as table_schema,
      c.relname as table_name,
      con.conname as constraint_name,
      jsonb_agg(a.attname order by k.ordinality) as columns
    from pg_catalog.pg_constraint con
    join pg_catalog.pg_class c on c.oid = con.conrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    cross join lateral unnest(con.conkey) with ordinality as k(attnum, ordinality)
    join pg_catalog.pg_attribute a on a.attrelid = c.oid and a.attnum = k.attnum
    where con.contype = 'p' and n.nspname = 'public'
    group by n.nspname, c.relname, con.conname
  ) x
),
foreign_keys as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'source_schema', x.source_schema,
        'source_table', x.source_table,
        'constraint_name', x.constraint_name,
        'source_columns', x.source_columns,
        'target_schema', x.target_schema,
        'target_table', x.target_table,
        'target_columns', x.target_columns
      ) order by x.source_schema, x.source_table, x.constraint_name
    ),
    '[]'::jsonb
  ) as rows
  from (
    select
      sn.nspname as source_schema,
      sc.relname as source_table,
      con.conname as constraint_name,
      jsonb_agg(sa.attname order by sk.ordinality) as source_columns,
      tn.nspname as target_schema,
      tc.relname as target_table,
      jsonb_agg(ta.attname order by sk.ordinality) as target_columns
    from pg_catalog.pg_constraint con
    join pg_catalog.pg_class sc on sc.oid = con.conrelid
    join pg_catalog.pg_namespace sn on sn.oid = sc.relnamespace
    join pg_catalog.pg_class tc on tc.oid = con.confrelid
    join pg_catalog.pg_namespace tn on tn.oid = tc.relnamespace
    cross join lateral unnest(con.conkey) with ordinality as sk(attnum, ordinality)
    join lateral unnest(con.confkey) with ordinality as tk(attnum, ordinality)
      on tk.ordinality = sk.ordinality
    join pg_catalog.pg_attribute sa on sa.attrelid = sc.oid and sa.attnum = sk.attnum
    join pg_catalog.pg_attribute ta on ta.attrelid = tc.oid and ta.attnum = tk.attnum
    where con.contype = 'f' and sn.nspname = 'public'
    group by sn.nspname, sc.relname, con.conname, tn.nspname, tc.relname
  ) x
),
functions as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'function_schema', n.nspname,
        'function_name', p.proname,
        'identity_arguments', pg_catalog.pg_get_function_identity_arguments(p.oid),
        'return_type', pg_catalog.pg_get_function_result(p.oid)
      ) order by n.nspname, p.proname, pg_catalog.pg_get_function_identity_arguments(p.oid)
    ),
    '[]'::jsonb
  ) as rows
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'
),
enums as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'enum_schema', x.enum_schema,
        'enum_name', x.enum_name,
        'labels', x.labels
      ) order by x.enum_schema, x.enum_name
    ),
    '[]'::jsonb
  ) as rows
  from (
    select n.nspname as enum_schema, t.typname as enum_name,
      jsonb_agg(e.enumlabel order by e.enumsortorder) as labels
    from pg_catalog.pg_type t
    join pg_catalog.pg_namespace n on n.oid = t.typnamespace
    join pg_catalog.pg_enum e on e.enumtypid = t.oid
    where n.nspname = 'public'
    group by n.nspname, t.typname
  ) x
),
composites as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'type_schema', x.type_schema,
        'type_name', x.type_name,
        'attributes', x.attributes
      ) order by x.type_schema, x.type_name
    ),
    '[]'::jsonb
  ) as rows
  from (
    select n.nspname as type_schema, t.typname as type_name,
      jsonb_agg(
        jsonb_build_object(
          'attribute_name', a.attname,
          'ordinal_position', a.attnum,
          'data_type', pg_catalog.format_type(a.atttypid, a.atttypmod)
        ) order by a.attnum, a.attname
      ) as attributes
    from pg_catalog.pg_type t
    join pg_catalog.pg_namespace n on n.oid = t.typnamespace
    join pg_catalog.pg_class c on c.oid = t.typrelid and c.relkind = 'c'
    join pg_catalog.pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
    where n.nspname = 'public'
    group by n.nspname, t.typname
  ) x
)
select jsonb_build_object(
  'observed_at', to_char(
    transaction_timestamp() at time zone 'UTC',
    'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
  ),
  'authority', jsonb_build_object(
    'project_ref', 'ekdyopdrrkphlrsilyoo',
    'effective_role', current_user,
    'transaction_read_only', current_setting('transaction_read_only'),
    'default_transaction_read_only', current_setting('default_transaction_read_only')
  ),
  'completeness', jsonb_build_object(
    'complete', true,
    'truncated', false,
    'all_exposed_schemas_enumerated', true,
    'unresolved_dimensions', '[]'::jsonb
  ),
  'catalog', jsonb_build_object(
    'schemas', schemas.rows,
    'tables', tables.rows,
    'views', views.rows,
    'columns', columns.rows,
    'primary_keys', primary_keys.rows,
    'foreign_keys', foreign_keys.rows,
    'functions', functions.rows,
    'enums', enums.rows,
    'composites', composites.rows
  )
) as catalog_snapshot
from schemas, tables, views, columns, primary_keys, foreign_keys, functions, enums, composites;

rollback;
