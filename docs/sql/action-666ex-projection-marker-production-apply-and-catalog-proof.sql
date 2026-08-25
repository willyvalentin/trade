-- Action 666EX: read-only post-apply catalog proof for the projection marker.
--
-- This query returns one aggregate object. It never returns application rows
-- or identifiers and it cannot change database state.
begin read only;

with
  expected_markers(relation_name, column_name) as (
    values
      ('recommendations'::text, 'recommendation_projection_contract'::text),
      ('positions', 'recommendation_projection_contract')
  ),
  expected_marker_checks(relation_name, constraint_name) as (
    values
      ('recommendations'::text, 'recommendations_recommendation_projection_contract_value_check'::text),
      ('recommendations', 'recommendations_lineage_projection_contract_complete_check'),
      ('positions', 'positions_recommendation_projection_contract_value_check'),
      ('positions', 'positions_lineage_projection_contract_complete_check')
  ),
  expected_base_checks(relation_name, constraint_name) as (
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
  'target_relations_present',
    pg_catalog.to_regclass('public.recommendations') is not null
    and pg_catalog.to_regclass('public.positions') is not null,
  'marker_columns_nullable_text_without_defaults_exact', (
    select count(*) = (select count(*) from expected_markers)
    from expected_markers
    join pg_catalog.pg_attribute as attribute_record
      on attribute_record.attrelid =
          ('public.' || expected_markers.relation_name)::pg_catalog.regclass
     and attribute_record.attname = expected_markers.column_name
     and attribute_record.atttypid = 'text'::pg_catalog.regtype
     and not attribute_record.attnotnull
     and not attribute_record.atthasdef
     and attribute_record.attnum > 0
     and not attribute_record.attisdropped
  ),
  'marker_checks_present_not_valid', (
    select count(*) = (select count(*) from expected_marker_checks)
    from expected_marker_checks
    join pg_catalog.pg_constraint as constraint_record
      on constraint_record.conrelid =
          ('public.' || expected_marker_checks.relation_name)::pg_catalog.regclass
     and constraint_record.conname = expected_marker_checks.constraint_name
     and constraint_record.contype = 'c'
     and not constraint_record.convalidated
  ),
  'base_checks_remain_present_not_valid', (
    select count(*) = (select count(*) from expected_base_checks)
    from expected_base_checks
    join pg_catalog.pg_constraint as constraint_record
      on constraint_record.conrelid =
          ('public.' || expected_base_checks.relation_name)::pg_catalog.regclass
     and constraint_record.conname = expected_base_checks.constraint_name
     and constraint_record.contype = 'c'
     and not constraint_record.convalidated
  ),
  'legacy_all_null_tuple_remains_catalog_admissible', (
    select count(*) = 2
    from pg_catalog.pg_constraint as constraint_record
    where constraint_record.conname in (
      'recommendations_lineage_projection_contract_complete_check',
      'positions_lineage_projection_contract_complete_check'
    )
      and pg_catalog.pg_get_constraintdef(constraint_record.oid, true)
          ilike '%recommendation_projection_contract IS NULL%'
  ),
  'rls_enabled', (
    coalesce(
      (select relrowsecurity
       from pg_catalog.pg_class
       where oid = 'public.recommendations'::pg_catalog.regclass),
      false
    )
    and coalesce(
      (select relrowsecurity
       from pg_catalog.pg_class
       where oid = 'public.positions'::pg_catalog.regclass),
      false
    )
  ),
  'client_select_denied', (
    not has_table_privilege('anon', 'public.recommendations', 'SELECT')
    and not has_table_privilege('authenticated', 'public.recommendations', 'SELECT')
    and not has_table_privilege('anon', 'public.positions', 'SELECT')
    and not has_table_privilege('authenticated', 'public.positions', 'SELECT')
  )
) as aggregate_catalog_proof;

rollback;
