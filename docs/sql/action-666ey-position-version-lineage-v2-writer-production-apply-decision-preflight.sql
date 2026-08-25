-- Action 666EY: read-only repeated production dependency decision for the v2 writer.
--
-- This transaction returns one aggregate object. It never returns application
-- rows or identifiers and it cannot change database state.
begin read only;

with
  base_lineage_columns(relation_name, column_name, type_name) as (
    values
      ('recommendations'::text, 'owner_user_id'::text, 'uuid'::text),
      ('recommendations', 'recommendation_version', 'int8'),
      ('recommendations', 'recommendation_identity', 'text'),
      ('recommendations', 'recommendation_normative_digest', 'text'),
      ('positions', 'owner_user_id', 'uuid'),
      ('positions', 'recommendation_id', 'uuid'),
      ('positions', 'position_version', 'int8'),
      ('positions', 'durable_recommendation_version', 'int8'),
      ('positions', 'recommendation_identity', 'text'),
      ('positions', 'recommendation_normative_digest', 'text')
  ),
  history_columns(column_name, type_name) as (
    values
      ('position_id'::text, 'uuid'::text),
      ('owner_user_id', 'uuid'),
      ('position_version', 'int8'),
      ('recommendation_id', 'uuid'),
      ('durable_recommendation_version', 'int8'),
      ('recommendation_identity', 'text'),
      ('recommendation_normative_digest', 'text'),
      ('position_state_frame', 'jsonb'),
      ('position_state_digest', 'text')
  ),
  projection_markers(relation_name, column_name) as (
    values
      ('recommendations'::text, 'recommendation_projection_contract'::text),
      ('positions', 'recommendation_projection_contract')
  )
select jsonb_build_object(
  'recommendations_relation_present',
    pg_catalog.to_regclass('public.recommendations') is not null,
  'positions_relation_present',
    pg_catalog.to_regclass('public.positions') is not null,
  'position_version_history_relation_present',
    pg_catalog.to_regclass('public.position_version_history') is not null,
  'base_lineage_prerequisite_columns_exact', (
    select count(*) = (select count(*) from base_lineage_columns)
    from base_lineage_columns
    join pg_catalog.pg_attribute as attribute_record
      on attribute_record.attrelid =
          ('public.' || base_lineage_columns.relation_name)::pg_catalog.regclass
     and attribute_record.attname = base_lineage_columns.column_name
     and attribute_record.atttypid =
          base_lineage_columns.type_name::pg_catalog.regtype
     and attribute_record.attnum > 0
     and not attribute_record.attisdropped
  ),
  'history_writer_columns_exact', (
    select count(*) = (select count(*) from history_columns)
    from history_columns
    join pg_catalog.pg_attribute as attribute_record
      on attribute_record.attrelid =
          'public.position_version_history'::pg_catalog.regclass
     and attribute_record.attname = history_columns.column_name
     and attribute_record.atttypid = history_columns.type_name::pg_catalog.regtype
     and attribute_record.attnum > 0
     and not attribute_record.attisdropped
  ),
  'projection_markers_nullable_text_without_defaults_exact', (
    select count(*) = (select count(*) from projection_markers)
    from projection_markers
    join pg_catalog.pg_attribute as attribute_record
      on attribute_record.attrelid =
          ('public.' || projection_markers.relation_name)::pg_catalog.regclass
     and attribute_record.attname = projection_markers.column_name
     and attribute_record.atttypid = 'text'::pg_catalog.regtype
     and not attribute_record.attnotnull
     and not attribute_record.atthasdef
     and attribute_record.attnum > 0
     and not attribute_record.attisdropped
  ),
  'receipt_relation_absent',
    pg_catalog.to_regclass('private.owner_bound_position_command_idempotency_v2')
      is null,
  'writer_routine_absent',
    pg_catalog.to_regprocedure(
      'private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)'
    ) is null,
  'recommendation_owner_index_absent',
    pg_catalog.to_regclass('private.obpciv2_receipt_recommendation_owner_idx')
      is null,
  'position_owner_index_absent',
    pg_catalog.to_regclass('private.obpciv2_receipt_position_owner_idx') is null,
  'pgcrypto_digest_dependency_present',
    pg_catalog.to_regprocedure('extensions.digest(bytea,text)') is not null,
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
