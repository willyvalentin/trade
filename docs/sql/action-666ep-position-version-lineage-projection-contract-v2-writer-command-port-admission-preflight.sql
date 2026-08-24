-- Action 666EP — isolated-staging catalog-only v2 command-port admission preflight.
--
-- This statement returns one JSON object of booleans. It does not select
-- application rows or identifiers and contains no DDL or DML.
with
  expected_columns(relation_id, column_name, type_id) as (
    values
      ('public.recommendations'::regclass, 'recommendation_version', 'int8'::regtype),
      ('public.recommendations'::regclass, 'recommendation_identity', 'text'::regtype),
      ('public.recommendations'::regclass, 'recommendation_normative_digest', 'text'::regtype),
      ('public.recommendations'::regclass, 'recommendation_projection_contract', 'text'::regtype),
      ('public.positions'::regclass, 'position_version', 'int8'::regtype),
      ('public.positions'::regclass, 'durable_recommendation_version', 'int8'::regtype),
      ('public.positions'::regclass, 'recommendation_identity', 'text'::regtype),
      ('public.positions'::regclass, 'recommendation_normative_digest', 'text'::regtype),
      ('public.positions'::regclass, 'recommendation_projection_contract', 'text'::regtype)
  ),
  expected_constraints(relation_id, constraint_name) as (
    values
      ('public.recommendations'::regclass, 'recommendations_recommendation_projection_contract_value_check'),
      ('public.recommendations'::regclass, 'recommendations_lineage_projection_contract_complete_check'),
      ('public.positions'::regclass, 'positions_recommendation_projection_contract_value_check'),
      ('public.positions'::regclass, 'positions_lineage_projection_contract_complete_check')
  ),
  required_binding_columns(column_name) as (
    values
      ('owner_user_id'),
      ('recommendation_id'),
      ('recommendation_version'),
      ('recommendation_identity'),
      ('recommendation_normative_digest'),
      ('recommendation_projection_contract'),
      ('position_id'),
      ('canonical_command_digest')
  ),
  v1_routine as (
    select procedure_record.oid, procedure_record.prosecdef, procedure_record.proconfig
    from pg_catalog.pg_proc procedure_record
    where procedure_record.oid = to_regprocedure(
      'public.app_open_owned_position_transaction(uuid,uuid,text,text,numeric,numeric,numeric,numeric,numeric,jsonb,text)'
    )
  )
select jsonb_build_object(
  'scope', 'isolated_staging_catalog_boolean_only',
  'v2_source_and_target_columns_are_nullable_expected_types',
  not exists (
    select 1
    from expected_columns expected
    where not exists (
      select 1
      from pg_catalog.pg_attribute attribute_record
      where attribute_record.attrelid = expected.relation_id
        and attribute_record.attname = expected.column_name
        and attribute_record.atttypid = expected.type_id
        and not attribute_record.attnotnull
        and attribute_record.attnum > 0
        and not attribute_record.attisdropped
    )
  ),
  'v2_marker_constraints_are_present_not_valid',
  not exists (
    select 1
    from expected_constraints expected
    left join pg_catalog.pg_constraint constraint_record
      on constraint_record.conrelid = expected.relation_id
     and constraint_record.conname = expected.constraint_name
    where constraint_record.oid is null
       or constraint_record.contype <> 'c'
       or constraint_record.convalidated
  ),
  'history_relation_is_owner_scoped_rls_append_only',
  exists (
    select 1
    from pg_catalog.pg_class relation_record
    join pg_catalog.pg_namespace namespace_record
      on namespace_record.oid = relation_record.relnamespace
    where namespace_record.nspname = 'public'
      and relation_record.relname = 'position_version_history'
      and relation_record.relrowsecurity
      and exists (
        select 1
        from pg_catalog.pg_trigger trigger_record
        where trigger_record.tgrelid = relation_record.oid
          and trigger_record.tgname = 'action_666di_position_version_history_append_only'
          and not trigger_record.tgisinternal
      )
  ),
  'target_tables_deny_anon_and_authenticated_table_privileges',
  not exists (
    select 1
    from pg_catalog.pg_class relation_record
    join pg_catalog.pg_namespace namespace_record
      on namespace_record.oid = relation_record.relnamespace
    cross join (values ('anon'::name), ('authenticated'::name)) as runtime_role(role_name)
    cross join (values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE')) as required_privilege(privilege_name)
    where namespace_record.nspname = 'public'
      and relation_record.relname in ('recommendations', 'positions', 'position_version_history')
      and relation_record.relkind = 'r'
      and has_table_privilege(runtime_role.role_name, relation_record.oid, required_privilege.privilege_name)
  ),
  'existing_v1_private_boundary_retained',
  exists (
    select 1
    from v1_routine routine
    where routine.prosecdef
      and routine.proconfig @> array['search_path=pg_catalog, public']::text[]
      and has_function_privilege('service_role', routine.oid, 'EXECUTE')
      and not has_function_privilege('anon', routine.oid, 'EXECUTE')
      and not has_function_privilege('authenticated', routine.oid, 'EXECUTE')
  ),
  'v2_marker_aware_writer_routine_present',
  exists (
    select 1
    from pg_catalog.pg_proc procedure_record
    join pg_catalog.pg_namespace namespace_record
      on namespace_record.oid = procedure_record.pronamespace
    where namespace_record.nspname = 'public'
      and position('recommendation_projection_contract' in procedure_record.prosrc) > 0
  ),
  'proven_complete_v2_idempotency_storage_present',
  exists (
    select 1
    from pg_catalog.pg_class relation_record
    join pg_catalog.pg_namespace namespace_record
      on namespace_record.oid = relation_record.relnamespace
    where namespace_record.nspname = 'public'
      and relation_record.relkind in ('r', 'p')
      and not exists (
        select 1
        from required_binding_columns required
        where not exists (
          select 1
          from pg_catalog.pg_attribute attribute_record
          where attribute_record.attrelid = relation_record.oid
            and attribute_record.attname = required.column_name
            and attribute_record.attnum > 0
            and not attribute_record.attisdropped
        )
      )
  ),
  'database_ddl_or_dml_executed', false,
  'production_targeted', false
) as admission_preflight;
