-- Action 666EZ: read-only post-apply catalog proof for the private v2 writer.
--
-- This query returns one aggregate object. It never returns application rows
-- or identifiers and it cannot change database state.
begin read only;

with
  expected_columns(column_name, type_name, has_default) as (
    values
      ('authenticated_server_owner','uuid',false),
      ('canonical_command_digest','text',false),
      ('opaque_recommendation_reference','uuid',false),
      ('recommendation_version','bigint',false),
      ('recommendation_identity','text',false),
      ('recommendation_normative_digest','text',false),
      ('recommendation_projection_contract','text',false),
      ('server_generated_position_identity','uuid',false),
      ('initial_position_version','bigint',false),
      ('committed_outcome','text',false),
      ('initial_history_identity','text',false),
      ('committed_at','timestamp with time zone',true)
  ),
  actual_constraint_types as (
    select contype::text as contype, count(*) as count
    from pg_constraint
    where conrelid = 'private.owner_bound_position_command_idempotency_v2'::regclass
    group by contype
  ),
  expected_constraint_types(contype, count) as (
    values ('p',1::bigint), ('u',1::bigint), ('f',2::bigint), ('c',8::bigint)
  )
select jsonb_build_object(
  'private_schema_exists', exists(select 1 from pg_namespace where nspname = 'private'),
  'service_role_private_usage_only', has_schema_privilege('service_role','private','USAGE')
    and not has_schema_privilege('anon','private','USAGE')
    and not has_schema_privilege('authenticated','private','USAGE'),
  'receipt_relation_exact_columns', (
    select count(*) = (select count(*) from expected_columns)
      and bool_and(a.attnotnull and format_type(a.atttypid,a.atttypmod) = e.type_name and a.atthasdef = e.has_default)
    from expected_columns e
    join pg_attribute a on a.attrelid = 'private.owner_bound_position_command_idempotency_v2'::regclass
      and a.attname = e.column_name and a.attnum > 0 and not a.attisdropped
  ),
  'receipt_rls_without_policies', (
    select c.relrowsecurity and not exists (
      select 1 from pg_policy p where p.polrelid = c.oid
    )
    from pg_class c where c.oid = 'private.owner_bound_position_command_idempotency_v2'::regclass
  ),
  'receipt_client_privileges_denied', not has_table_privilege('anon','private.owner_bound_position_command_idempotency_v2','SELECT,INSERT,UPDATE,DELETE')
    and not has_table_privilege('authenticated','private.owner_bound_position_command_idempotency_v2','SELECT,INSERT,UPDATE,DELETE'),
  'receipt_constraint_shape_and_validation', (
    not exists (
      select 1 from expected_constraint_types e
      full join actual_constraint_types a using (contype)
      where coalesce(e.count,0) <> coalesce(a.count,0)
    )
    and (select count(*) = 2 and bool_and(convalidated)
      from pg_constraint
      where conrelid = 'private.owner_bound_position_command_idempotency_v2'::regclass and contype = 'f')
    and (select count(*) = 8 and bool_and(convalidated)
      from pg_constraint
      where conrelid = 'private.owner_bound_position_command_idempotency_v2'::regclass and contype = 'c')
  ),
  'foreign_keys_target_expected_parents', (
    select count(*) = 2
      and bool_and(confrelid in ('public.recommendations'::regclass, 'public.positions'::regclass))
    from pg_constraint
    where conrelid = 'private.owner_bound_position_command_idempotency_v2'::regclass and contype = 'f'
  ),
  'position_owner_fk_deferred', exists (
    select 1 from pg_constraint
     where conrelid = 'private.owner_bound_position_command_idempotency_v2'::regclass
       and contype = 'f'
       and confrelid = 'public.positions'::regclass
       and condeferrable and condeferred
  ),
  'receipt_foreign_key_indexes_valid', (
    select count(*) = 2 and bool_and(i.indisvalid and i.indisready)
    from pg_class c
    join pg_index i on i.indexrelid = c.oid
    where c.oid in (
      'private.obpciv2_receipt_recommendation_owner_idx'::regclass,
      'private.obpciv2_receipt_position_owner_idx'::regclass
    )
  ),
  'writer_routine_hardened', exists (
    select 1 from pg_proc
    where oid = 'private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)'::regprocedure
      and prosecdef
      and coalesce(proconfig, array[]::text[]) @> array['search_path=""']
  ),
  'writer_routine_execute_restricted', has_function_privilege('service_role','private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)','EXECUTE')
    and not has_function_privilege('anon','private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)','EXECUTE')
    and not has_function_privilege('authenticated','private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)','EXECUTE'),
  'parent_rls_and_client_select_denial_intact', (
    select bool_and(c.relrowsecurity)
      and bool_and(not has_table_privilege('anon', c.oid, 'SELECT'))
      and bool_and(not has_table_privilege('authenticated', c.oid, 'SELECT'))
    from pg_class c
    where c.oid in ('public.recommendations'::regclass, 'public.positions'::regclass)
  )
) as aggregate_catalog_proof;

rollback;
