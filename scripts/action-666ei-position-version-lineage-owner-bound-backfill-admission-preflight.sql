-- Action 666EI — aggregate-only owner-bound lineage-backfill admission proof.
--
-- This transaction is intentionally read-only. It never returns a row, owner,
-- lineage value, connection identifier, or credential. It determines whether
-- the now-null production population remains admissible for a later, separate
-- owner-scoped backfill implementation; it does not authorize or perform it.

begin transaction isolation level repeatable read read only;

set local statement_timeout = '20s';
set local lock_timeout = '1s';
set local idle_in_transaction_session_timeout = '20s';
set local search_path = pg_catalog;
set local row_security = off;

with
recommendation_population as (
  select
    count(*)::bigint as total_rows,
    count(*) filter (where created_at is null)::bigint as created_at_null_rows,
    count(*) filter (where owner_user_id is null)::bigint as owner_null_rows,
    count(*) filter (
      where id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    )::bigint as noncanonical_id_rows,
    count(*) filter (
      where direction is null
         or session_type is null
         or status is null
         or ticker is null
    )::bigint as required_projection_null_rows,
    count(*) filter (
      where direction ~ '[[:cntrl:]]'
         or session_type ~ '[[:cntrl:]]'
         or status ~ '[[:cntrl:]]'
         or ticker ~ '[[:cntrl:]]'
         or coalesce(company_name, '') ~ '[[:cntrl:]]'
         or coalesce(confidence, '') ~ '[[:cntrl:]]'
         or coalesce(invalidation, '') ~ '[[:cntrl:]]'
         or coalesce(reason_to_avoid, '') ~ '[[:cntrl:]]'
         or coalesce(setup_type, '') ~ '[[:cntrl:]]'
         or coalesce(thesis, '') ~ '[[:cntrl:]]'
         or coalesce(timeframe, '') ~ '[[:cntrl:]]'
    )::bigint as projection_control_character_rows,
    count(*) filter (
      where (entry_high is not null and entry_high::text !~ '^-?(?:0|[1-9][0-9]*)(?:[.][0-9]+)?$')
         or (entry_low is not null and entry_low::text !~ '^-?(?:0|[1-9][0-9]*)(?:[.][0-9]+)?$')
         or (risk_reward is not null and risk_reward::text !~ '^-?(?:0|[1-9][0-9]*)(?:[.][0-9]+)?$')
         or (stop_loss is not null and stop_loss::text !~ '^-?(?:0|[1-9][0-9]*)(?:[.][0-9]+)?$')
         or (target_1 is not null and target_1::text !~ '^-?(?:0|[1-9][0-9]*)(?:[.][0-9]+)?$')
         or (target_2 is not null and target_2::text !~ '^-?(?:0|[1-9][0-9]*)(?:[.][0-9]+)?$')
    )::bigint as non_lossless_decimal_rows,
    count(*) filter (
      where num_nonnulls(
        recommendation_version,
        recommendation_identity,
        recommendation_normative_digest
      ) = 0
    )::bigint as all_null_lineage_rows,
    count(*) filter (
      where num_nonnulls(
        recommendation_version,
        recommendation_identity,
        recommendation_normative_digest
      ) between 1 and 2
    )::bigint as partial_lineage_rows,
    count(*) filter (
      where num_nonnulls(
        recommendation_version,
        recommendation_identity,
        recommendation_normative_digest
      ) = 3
    )::bigint as complete_lineage_rows
  from public.recommendations
),
position_population as (
  select
    count(*)::bigint as total_rows,
    count(*) filter (where created_at is null)::bigint as created_at_null_rows,
    count(*) filter (where owner_user_id is null)::bigint as owner_null_rows,
    count(*) filter (where recommendation_id is null)::bigint as recommendation_id_null_rows,
    count(*) filter (
      where num_nonnulls(
        position_version,
        durable_recommendation_version,
        recommendation_identity,
        recommendation_normative_digest
      ) = 0
    )::bigint as all_null_lineage_rows,
    count(*) filter (
      where num_nonnulls(
        position_version,
        durable_recommendation_version,
        recommendation_identity,
        recommendation_normative_digest
      ) between 1 and 3
    )::bigint as partial_lineage_rows,
    count(*) filter (
      where num_nonnulls(
        position_version,
        durable_recommendation_version,
        recommendation_identity,
        recommendation_normative_digest
      ) = 4
    )::bigint as complete_lineage_rows
  from public.positions
),
owner_bound_links as (
  select
    count(*) filter (
      where p.recommendation_id is not null and r.id is null
    )::bigint as orphan_rows,
    count(*) filter (
      where p.recommendation_id is not null
        and r.id is not null
        and r.owner_user_id is distinct from p.owner_user_id
    )::bigint as owner_mismatch_rows,
    count(*) filter (
      where p.recommendation_id is not null
        and r.id is not null
        and r.owner_user_id = p.owner_user_id
        and num_nonnulls(
          r.recommendation_version,
          r.recommendation_identity,
          r.recommendation_normative_digest
        ) = 0
        and num_nonnulls(
          p.position_version,
          p.durable_recommendation_version,
          p.recommendation_identity,
          p.recommendation_normative_digest
        ) = 0
    )::bigint as all_null_owner_bound_copy_candidates,
    count(*) filter (
      where p.recommendation_id is not null
        and r.id is not null
        and r.owner_user_id = p.owner_user_id
        and (
          num_nonnulls(
            r.recommendation_version,
            r.recommendation_identity,
            r.recommendation_normative_digest
          ) <> 0
          or num_nonnulls(
            p.position_version,
            p.durable_recommendation_version,
            p.recommendation_identity,
            p.recommendation_normative_digest
          ) <> 0
        )
    )::bigint as non_null_owner_bound_link_rows
  from public.positions p
  left join public.recommendations r on r.id = p.recommendation_id
),
duplicate_links as (
  select
    count(*)::bigint as duplicate_groups,
    coalesce(sum(grouped.position_count), 0)::bigint as duplicate_rows
  from (
    select count(*)::bigint as position_count
    from public.positions
    where recommendation_id is not null
    group by owner_user_id, recommendation_id
    having count(*) > 1
  ) grouped
),
owner_batch_shape as (
  select
    count(*)::bigint as owners_with_pending_recommendations,
    coalesce(max(grouped.recommendation_count), 0)::bigint as maximum_pending_recommendations_per_owner
  from (
    select owner_user_id, count(*)::bigint as recommendation_count
    from public.recommendations
    where num_nonnulls(
      recommendation_version,
      recommendation_identity,
      recommendation_normative_digest
    ) = 0
    group by owner_user_id
  ) grouped
),
catalog_guards as (
  select
    count(*) filter (
      where relation_id = attribute_record.attrelid
        and column_name = attribute_record.attname
        and type_id = attribute_record.atttypid
        and not attribute_record.attnotnull
        and attribute_record.attnum > 0
        and not attribute_record.attisdropped
    )::integer = 7 as exact_nullable_lineage_column_shape,
    (
      select count(*)::integer
      from pg_catalog.pg_constraint c
      where c.conrelid in ('public.recommendations'::regclass, 'public.positions'::regclass)
        and c.conname in (
          'recommendations_recommendation_version_safe_range_check',
          'recommendations_recommendation_identity_present_check',
          'recommendations_recommendation_normative_digest_format_check',
          'recommendations_lineage_tuple_complete_check',
          'positions_position_version_safe_range_check',
          'positions_durable_recommendation_version_safe_range_check',
          'positions_recommendation_identity_present_check',
          'positions_recommendation_normative_digest_format_check',
          'positions_lineage_tuple_complete_check'
        )
        and not c.convalidated
    ) = 9 as exact_not_valid_lineage_check_shape,
    coalesce((
      select c.relrowsecurity
      from pg_catalog.pg_class c
      where c.oid = 'public.recommendations'::regclass
    ), false) as recommendations_rls_enabled,
    coalesce((
      select c.relrowsecurity
      from pg_catalog.pg_class c
      where c.oid = 'public.positions'::regclass
    ), false) as positions_rls_enabled
  from (
    values
      ('public.recommendations'::regclass, 'recommendation_version', 'int8'::regtype),
      ('public.recommendations'::regclass, 'recommendation_identity', 'text'::regtype),
      ('public.recommendations'::regclass, 'recommendation_normative_digest', 'text'::regtype),
      ('public.positions'::regclass, 'position_version', 'int8'::regtype),
      ('public.positions'::regclass, 'durable_recommendation_version', 'int8'::regtype),
      ('public.positions'::regclass, 'recommendation_identity', 'text'::regtype),
      ('public.positions'::regclass, 'recommendation_normative_digest', 'text'::regtype)
  ) as expected(relation_id, column_name, type_id)
  join pg_catalog.pg_attribute attribute_record
    on attribute_record.attrelid = expected.relation_id
   and attribute_record.attname = expected.column_name
)
select pg_catalog.jsonb_build_object(
  'contract_version', 'position_version_lineage_owner_bound_backfill_admission_preflight_v1',
  'transaction_read_only', current_setting('transaction_read_only') = 'on',
  'transaction_isolation', current_setting('transaction_isolation'),
  'row_security_fail_closed', current_setting('row_security') = 'off',
  'recommendations', pg_catalog.jsonb_build_object(
    'total', recommendation_population.total_rows,
    'created_at_null', recommendation_population.created_at_null_rows,
    'owner_null', recommendation_population.owner_null_rows,
    'noncanonical_id', recommendation_population.noncanonical_id_rows,
    'required_projection_null', recommendation_population.required_projection_null_rows,
    'projection_control_character', recommendation_population.projection_control_character_rows,
    'non_lossless_decimal', recommendation_population.non_lossless_decimal_rows,
    'all_null_lineage', recommendation_population.all_null_lineage_rows,
    'partial_lineage', recommendation_population.partial_lineage_rows,
    'complete_lineage', recommendation_population.complete_lineage_rows
  ),
  'positions', pg_catalog.jsonb_build_object(
    'total', position_population.total_rows,
    'created_at_null', position_population.created_at_null_rows,
    'owner_null', position_population.owner_null_rows,
    'recommendation_id_null', position_population.recommendation_id_null_rows,
    'all_null_lineage', position_population.all_null_lineage_rows,
    'partial_lineage', position_population.partial_lineage_rows,
    'complete_lineage', position_population.complete_lineage_rows
  ),
  'owner_bound_links', pg_catalog.jsonb_build_object(
    'orphan', owner_bound_links.orphan_rows,
    'owner_mismatch', owner_bound_links.owner_mismatch_rows,
    'all_null_copy_candidate', owner_bound_links.all_null_owner_bound_copy_candidates,
    'non_null_owner_bound_link', owner_bound_links.non_null_owner_bound_link_rows,
    'duplicate_groups', duplicate_links.duplicate_groups,
    'duplicate_rows', duplicate_links.duplicate_rows
  ),
  'owner_batch_shape', pg_catalog.jsonb_build_object(
    'owners_with_pending_recommendations', owner_batch_shape.owners_with_pending_recommendations,
    'maximum_pending_recommendations_per_owner', owner_batch_shape.maximum_pending_recommendations_per_owner,
    'per_owner_batch_limit', 100
  ),
  'catalog_guards', pg_catalog.jsonb_build_object(
    'exact_nullable_lineage_column_shape', catalog_guards.exact_nullable_lineage_column_shape,
    'exact_not_valid_lineage_check_shape', catalog_guards.exact_not_valid_lineage_check_shape,
    'recommendations_rls_enabled', catalog_guards.recommendations_rls_enabled,
    'positions_rls_enabled', catalog_guards.positions_rls_enabled
  ),
  'privacy', pg_catalog.jsonb_build_object(
    'aggregate_counts_and_booleans_only', true,
    'row_contents_returned', false,
    'row_identifiers_returned', false,
    'owner_identifiers_returned', false,
    'connection_identifier_returned', false,
    'credential_returned', false
  )
) as owner_bound_backfill_admission_preflight
from recommendation_population
cross join position_population
cross join owner_bound_links
cross join duplicate_links
cross join owner_batch_shape
cross join catalog_guards;

rollback;
