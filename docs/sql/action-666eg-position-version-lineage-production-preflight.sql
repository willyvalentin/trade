-- Action 666EG — production decision/preflight only.
--
-- This is a single read-only transaction. Its result is one aggregate JSON
-- object: it never returns application-row contents or identifiers.
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
  ),
  v1 as (
    select procedure.oid, procedure.prosecdef, procedure.proconfig
    from pg_catalog.pg_proc as procedure
    where procedure.oid = to_regprocedure(
      'public.app_open_owned_position_transaction(uuid,uuid,text,text,numeric,numeric,numeric,numeric,numeric,jsonb,text)'
    )
  )
select jsonb_build_object(
  'recommendations_exists', to_regclass('public.recommendations') is not null,
  'positions_exists', to_regclass('public.positions') is not null,
  'position_version_history_exists', to_regclass('public.position_version_history') is not null,
  'target_lineage_column_count', (
    select count(*) from expected_columns
    join pg_catalog.pg_attribute as attribute_record
      on attribute_record.attrelid = ('public.' || expected_columns.relation_name)::regclass
     and attribute_record.attname = expected_columns.column_name
     and attribute_record.attnum > 0
     and not attribute_record.attisdropped
  ),
  'target_lineage_constraint_count', (
    select count(*) from expected_constraints
    join pg_catalog.pg_constraint as constraint_record
      on constraint_record.conrelid = ('public.' || expected_constraints.relation_name)::regclass
     and constraint_record.conname = expected_constraints.constraint_name
  ),
  'recommendation_count', (select count(*) from public.recommendations),
  'position_count', (select count(*) from public.positions),
  'positions_without_recommendation_count', (
    select count(*) from public.positions as position_record
    where position_record.recommendation_id is null
  ),
  'position_version_history_count', (select count(*) from public.position_version_history),
  'v1_command_present', exists(select 1 from v1),
  'v1_security_definer', coalesce((select prosecdef from v1), false),
  'v1_fixed_search_path', coalesce(
    (select proconfig @> array['search_path=pg_catalog, public'] from v1), false
  ),
  'v1_anon_execute_denied', coalesce(
    (select not has_function_privilege('anon', oid, 'EXECUTE') from v1), false
  ),
  'v1_authenticated_execute_denied', coalesce(
    (select not has_function_privilege('authenticated', oid, 'EXECUTE') from v1), false
  ),
  'v1_service_role_execute_granted', coalesce(
    (select has_function_privilege('service_role', oid, 'EXECUTE') from v1), false
  ),
  'recommendations_rls_enabled', coalesce(
    (select relrowsecurity from pg_catalog.pg_class where oid = 'public.recommendations'::regclass), false
  ),
  'positions_rls_enabled', coalesce(
    (select relrowsecurity from pg_catalog.pg_class where oid = 'public.positions'::regclass), false
  ),
  'anon_and_authenticated_select_denied', (
    not has_table_privilege('anon', 'public.recommendations', 'SELECT')
    and not has_table_privilege('authenticated', 'public.recommendations', 'SELECT')
    and not has_table_privilege('anon', 'public.positions', 'SELECT')
    and not has_table_privilege('authenticated', 'public.positions', 'SELECT')
  )
) as aggregate_preflight;

rollback;
