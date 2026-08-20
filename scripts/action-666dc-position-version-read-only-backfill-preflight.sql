begin transaction isolation level repeatable read read only;

set local statement_timeout = '15s';
set local lock_timeout = '1s';
set local idle_in_transaction_session_timeout = '15s';
set local search_path = pg_catalog;

with
recommendation_counts as (
  select
    count(*)::bigint as total_rows,
    count(*) filter (where created_at is null)::bigint as created_at_null_rows,
    count(*) filter (where created_at is not null)::bigint as identity_seed_eligible_rows
  from public.recommendations
),
position_counts as (
  select
    count(*)::bigint as total_rows,
    count(*) filter (where recommendation_id is null)::bigint as recommendation_id_null_rows,
    count(*) filter (where recommendation_id is not null)::bigint as recommendation_id_present_rows,
    count(*) filter (where created_at is null)::bigint as created_at_null_rows
  from public.positions
),
position_link_counts as (
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
    )::bigint as owner_bound_rows,
    count(*) filter (
      where p.recommendation_id is not null
        and r.id is not null
        and r.owner_user_id = p.owner_user_id
        and r.created_at is not null
    )::bigint as lineage_copy_eligible_rows,
    count(*) filter (
      where p.recommendation_id is null
        or r.id is null
        or r.owner_user_id is distinct from p.owner_user_id
        or r.created_at is null
    )::bigint as lineage_copy_blocked_rows
  from public.positions p
  left join public.recommendations r on r.id = p.recommendation_id
),
duplicate_link_counts as (
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
unlinked_recommendation_counts as (
  select count(*) filter (where p.id is null)::bigint as rows_without_position
  from public.recommendations r
  left join public.positions p
    on p.recommendation_id = r.id
   and p.owner_user_id = r.owner_user_id
),
catalog_guards as (
  select
    exists (
      select 1
      from pg_catalog.pg_constraint c
      where c.conrelid = 'public.positions'::regclass
        and c.conname = 'positions_recommendation_owner_fkey'
        and c.contype = 'f'
        and c.convalidated
        and c.confrelid = 'public.recommendations'::regclass
        and (
          select pg_catalog.array_agg(a.attname order by k.ordinality)
          from pg_catalog.unnest(c.conkey) with ordinality as k(attnum, ordinality)
          join pg_catalog.pg_attribute a
            on a.attrelid = c.conrelid
           and a.attnum = k.attnum
        ) = array['recommendation_id', 'owner_user_id']::name[]
        and (
          select pg_catalog.array_agg(a.attname order by k.ordinality)
          from pg_catalog.unnest(c.confkey) with ordinality as k(attnum, ordinality)
          join pg_catalog.pg_attribute a
            on a.attrelid = c.confrelid
           and a.attnum = k.attnum
        ) = array['id', 'owner_user_id']::name[]
    ) as owner_bound_foreign_key_valid,
    exists (
      select 1
      from pg_catalog.pg_class i
      join pg_catalog.pg_namespace n on n.oid = i.relnamespace
      join pg_catalog.pg_index x on x.indexrelid = i.oid
      where n.nspname = 'public'
        and i.relname = 'recommendations_id_owner_user_id_uidx'
        and x.indisunique
        and x.indisvalid
        and x.indisready
        and x.indpred is null
        and x.indexprs is null
        and (
          select pg_catalog.array_agg(a.attname order by k.ordinality)
          from pg_catalog.unnest(x.indkey) with ordinality as k(attnum, ordinality)
          join pg_catalog.pg_attribute a
            on a.attrelid = x.indrelid
           and a.attnum = k.attnum
          where k.ordinality <= x.indnkeyatts
        ) = array['id', 'owner_user_id']::name[]
    ) as recommendation_owner_unique_index_valid,
    exists (
      select 1
      from pg_catalog.pg_class i
      join pg_catalog.pg_namespace n on n.oid = i.relnamespace
      join pg_catalog.pg_index x on x.indexrelid = i.oid
      where n.nspname = 'public'
        and i.relname = 'positions_recommendation_owner_idx'
        and x.indisvalid
        and x.indisready
        and x.indpred is null
        and x.indexprs is null
        and (
          select pg_catalog.array_agg(a.attname order by k.ordinality)
          from pg_catalog.unnest(x.indkey) with ordinality as k(attnum, ordinality)
          join pg_catalog.pg_attribute a
            on a.attrelid = x.indrelid
           and a.attnum = k.attnum
          where k.ordinality <= x.indnkeyatts
        ) = array['recommendation_id', 'owner_user_id']::name[]
    ) as position_owner_reference_index_valid,
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
)
select pg_catalog.jsonb_build_object(
  'contract_version', 'position_version_read_only_backfill_preflight_v1',
  'transaction_read_only', current_setting('transaction_read_only') = 'on',
  'transaction_isolation', current_setting('transaction_isolation'),
  'row_counts', pg_catalog.jsonb_build_object(
    'recommendations', recommendation_counts.total_rows,
    'positions', position_counts.total_rows,
    'recommendations_created_at_null', recommendation_counts.created_at_null_rows,
    'positions_created_at_null', position_counts.created_at_null_rows
  ),
  'link_integrity', pg_catalog.jsonb_build_object(
    'positions_recommendation_id_null', position_counts.recommendation_id_null_rows,
    'positions_recommendation_id_present', position_counts.recommendation_id_present_rows,
    'positions_orphaned_recommendation', position_link_counts.orphan_rows,
    'positions_owner_mismatch', position_link_counts.owner_mismatch_rows,
    'positions_owner_bound', position_link_counts.owner_bound_rows,
    'duplicate_owner_bound_link_groups', duplicate_link_counts.duplicate_groups,
    'duplicate_owner_bound_link_rows', duplicate_link_counts.duplicate_rows,
    'recommendations_without_position', unlinked_recommendation_counts.rows_without_position
  ),
  'backfill_classes', pg_catalog.jsonb_build_object(
    'recommendations_identity_seed_eligible', recommendation_counts.identity_seed_eligible_rows,
    'positions_lineage_copy_eligible', position_link_counts.lineage_copy_eligible_rows,
    'positions_lineage_copy_blocked', position_link_counts.lineage_copy_blocked_rows
  ),
  'catalog_guards', pg_catalog.jsonb_build_object(
    'owner_bound_foreign_key_valid', catalog_guards.owner_bound_foreign_key_valid,
    'recommendation_owner_unique_index_valid', catalog_guards.recommendation_owner_unique_index_valid,
    'position_owner_reference_index_valid', catalog_guards.position_owner_reference_index_valid,
    'recommendations_rls_enabled', catalog_guards.recommendations_rls_enabled,
    'positions_rls_enabled', catalog_guards.positions_rls_enabled
  ),
  'privacy', pg_catalog.jsonb_build_object(
    'aggregate_counts_and_booleans_only', true,
    'row_contents_returned', false,
    'row_identifiers_returned', false,
    'owner_identifiers_returned', false
  )
) as preflight_inventory
from recommendation_counts
cross join position_counts
cross join position_link_counts
cross join duplicate_link_counts
cross join unlinked_recommendation_counts
cross join catalog_guards;

rollback;
