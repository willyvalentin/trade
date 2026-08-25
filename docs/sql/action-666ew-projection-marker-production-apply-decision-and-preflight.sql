-- Action 666EW: read-only production decision for the v2 projection marker.
--
-- This transaction returns one aggregate object. It never returns application
-- rows or identifiers and it cannot change database state.
begin read only;

with
  expected_columns(relation_name, column_name, type_name) as (
    values
      ('recommendations'::text, 'recommendation_version'::text, 'int8'::text),
      ('recommendations', 'recommendation_identity', 'text'),
      ('recommendations', 'recommendation_normative_digest', 'text'),
      ('positions', 'position_version', 'int8'),
      ('positions', 'durable_recommendation_version', 'int8'),
      ('positions', 'recommendation_identity', 'text'),
      ('positions', 'recommendation_normative_digest', 'text')
  ),
  expected_constraints(relation_name, constraint_name) as (
    values
      ('recommendations'::text, 'recommendations_recommendation_version_safe_range_check'::text),
      ('recommendations', 'recommendations_recommendation_identity_present_check'),
      ('recommendations', 'recommendations_recommendation_normative_digest_format_check'),
      ('recommendations', 'recommendations_lineage_tuple_complete_check'),
      ('positions', 'positions_position_version_safe_range_check'),
      ('positions', 'positions_durable_recommendation_version_safe_range_check'),
      ('positions', 'positions_recommendation_identity_present_check'),
      ('positions', 'positions_recommendation_normative_digest_format_check'),
      ('positions', 'positions_lineage_tuple_complete_check')
  )
select jsonb_build_object(
  'recommendations_relation_present',
    pg_catalog.to_regclass('public.recommendations') is not null,
  'positions_relation_present',
    pg_catalog.to_regclass('public.positions') is not null,
  'base_lineage_columns_nullable_exact_without_defaults', (
    select count(*) = (select count(*) from expected_columns)
    from expected_columns
    join pg_catalog.pg_attribute as attribute_record
      on attribute_record.attrelid =
          ('public.' || expected_columns.relation_name)::pg_catalog.regclass
     and attribute_record.attname = expected_columns.column_name
     and attribute_record.atttypid = expected_columns.type_name::pg_catalog.regtype
     and not attribute_record.attnotnull
     and not attribute_record.atthasdef
     and attribute_record.attnum > 0
     and not attribute_record.attisdropped
  ),
  'base_lineage_constraints_present_not_valid', (
    select count(*) = (select count(*) from expected_constraints)
    from expected_constraints
    join pg_catalog.pg_constraint as constraint_record
      on constraint_record.conrelid =
          ('public.' || expected_constraints.relation_name)::pg_catalog.regclass
     and constraint_record.conname = expected_constraints.constraint_name
     and constraint_record.contype = 'c'
     and not constraint_record.convalidated
  ),
  'recommendation_projection_marker_absent', not exists (
    select 1
    from pg_catalog.pg_attribute
    where attrelid = 'public.recommendations'::pg_catalog.regclass
      and attname = 'recommendation_projection_contract'
      and attnum > 0
      and not attisdropped
  ),
  'position_projection_marker_absent', not exists (
    select 1
    from pg_catalog.pg_attribute
    where attrelid = 'public.positions'::pg_catalog.regclass
      and attname = 'recommendation_projection_contract'
      and attnum > 0
      and not attisdropped
  ),
  'recommendations_rls_enabled', coalesce(
    (select relrowsecurity
     from pg_catalog.pg_class
     where oid = 'public.recommendations'::pg_catalog.regclass),
    false
  ),
  'positions_rls_enabled', coalesce(
    (select relrowsecurity
     from pg_catalog.pg_class
     where oid = 'public.positions'::pg_catalog.regclass),
    false
  ),
  'public_client_select_denied', (
    not has_table_privilege('anon', 'public.recommendations', 'SELECT')
    and not has_table_privilege('authenticated', 'public.recommendations', 'SELECT')
    and not has_table_privilege('anon', 'public.positions', 'SELECT')
    and not has_table_privilege('authenticated', 'public.positions', 'SELECT')
  )
) as aggregate_preflight;

rollback;
