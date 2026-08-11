-- MUTATING production activation. Run only after the reviewed migration is
-- applied and all affected writers are confirmed paused.
-- Edit only the three VALUES fields below. The defaults fail closed.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '120s';
set local idle_in_transaction_session_timeout = '60s';

select pg_advisory_xact_lock(
  hashtextextended('ture_action_660_ma05_owner_activation', 0)
);

create temporary table ma05_operator_input (
  owner_user_id uuid primary key,
  writers_paused boolean not null,
  confirmation text not null
) on commit drop;

insert into ma05_operator_input (owner_user_id, writers_paused, confirmation)
values (
  'REPLACE_WITH_EXPLICITLY_CONFIRMED_AUTH_USER_UUID'::uuid,
  false,
  'REPLACE_WITH_MA05_OWNER_ACTIVATION_APPROVED'
);

do $$
declare
  v_owner_user_id uuid;
  v_writers_paused boolean;
  v_confirmation text;
  v_expected_constraint_count integer;
begin
  select owner_user_id, writers_paused, confirmation
    into strict v_owner_user_id, v_writers_paused, v_confirmation
  from ma05_operator_input;

  if not v_writers_paused
    or v_confirmation <> 'MA05_OWNER_ACTIVATION_APPROVED'
  then
    raise exception 'ma05_writers_not_confirmed_paused';
  end if;

  if (select count(*) from auth.users where id = v_owner_user_id) <> 1 then
    raise exception 'ma05_explicit_auth_owner_not_found';
  end if;

  if exists (
    select 1
    from (
      select owner_user_id from public.recommendations where owner_user_id is not null
      union all select owner_user_id from public.positions where owner_user_id is not null
      union all select owner_user_id from public.position_updates where owner_user_id is not null
      union all select owner_user_id from public.user_settings where owner_user_id is not null
      union all select owner_user_id from public.recommendation_snapshots where owner_user_id is not null
      union all select owner_user_id from public.recommendation_scan_runs where owner_user_id is not null
      union all select owner_user_id from public.recommendation_batches where owner_user_id is not null
      union all select owner_user_id from public.recommendation_outcomes where owner_user_id is not null
      union all select user_id from public.execution_records where user_id is not null
    ) existing_owner
    where existing_owner.owner_user_id <> v_owner_user_id
  ) then
    raise exception 'ma05_conflicting_existing_owner_detected';
  end if;

  select count(*) into v_expected_constraint_count
  from (values
    ('public.recommendations'::regclass, 'recommendations_owner_user_id_fkey'),
    ('public.positions'::regclass, 'positions_owner_user_id_fkey'),
    ('public.position_updates'::regclass, 'position_updates_owner_user_id_fkey'),
    ('public.user_settings'::regclass, 'user_settings_owner_user_id_fkey'),
    ('public.recommendation_snapshots'::regclass, 'recommendation_snapshots_owner_user_id_fkey'),
    ('public.recommendation_scan_runs'::regclass, 'recommendation_scan_runs_owner_user_id_fkey'),
    ('public.recommendation_batches'::regclass, 'recommendation_batches_owner_user_id_fkey'),
    ('public.recommendation_outcomes'::regclass, 'recommendation_outcomes_owner_user_id_fkey'),
    ('public.execution_records'::regclass, 'execution_records_user_id_fkey'),
    ('public.recommendations'::regclass, 'recommendations_owner_required_check'),
    ('public.positions'::regclass, 'positions_owner_required_check'),
    ('public.position_updates'::regclass, 'position_updates_owner_required_check'),
    ('public.user_settings'::regclass, 'user_settings_owner_required_check'),
    ('public.recommendation_snapshots'::regclass, 'recommendation_snapshots_owner_required_check'),
    ('public.recommendation_scan_runs'::regclass, 'recommendation_scan_runs_owner_required_check'),
    ('public.recommendation_batches'::regclass, 'recommendation_batches_owner_required_check'),
    ('public.recommendation_outcomes'::regclass, 'recommendation_outcomes_owner_required_check'),
    ('public.execution_records'::regclass, 'execution_records_user_required_check'),
    ('public.positions'::regclass, 'positions_recommendation_owner_fkey'),
    ('public.position_updates'::regclass, 'position_updates_position_owner_fkey')
  ) expected(relation_oid, constraint_name)
  join pg_constraint constraint_record
    on constraint_record.conrelid = expected.relation_oid
   and constraint_record.conname = expected.constraint_name;

  if v_expected_constraint_count <> 20 then
    raise exception 'ma05_reviewed_migration_constraints_missing';
  end if;
end;
$$;

create temporary table ma05_pre_counts (
  table_name text primary key,
  row_count bigint not null
) on commit drop;

insert into ma05_pre_counts (table_name, row_count)
select 'recommendations', count(*)::bigint from public.recommendations
union all select 'positions', count(*)::bigint from public.positions
union all select 'position_updates', count(*)::bigint from public.position_updates
union all select 'user_settings', count(*)::bigint from public.user_settings
union all select 'recommendation_snapshots', count(*)::bigint from public.recommendation_snapshots
union all select 'recommendation_scan_runs', count(*)::bigint from public.recommendation_scan_runs
union all select 'recommendation_batches', count(*)::bigint from public.recommendation_batches
union all select 'recommendation_outcomes', count(*)::bigint from public.recommendation_outcomes
union all select 'execution_records', count(*)::bigint from public.execution_records;

update public.recommendations
set owner_user_id = (select owner_user_id from ma05_operator_input)
where owner_user_id is null;

update public.positions
set owner_user_id = (select owner_user_id from ma05_operator_input)
where owner_user_id is null;

update public.position_updates
set owner_user_id = (select owner_user_id from ma05_operator_input)
where owner_user_id is null;

update public.user_settings
set owner_user_id = (select owner_user_id from ma05_operator_input)
where owner_user_id is null;

update public.recommendation_snapshots
set owner_user_id = (select owner_user_id from ma05_operator_input)
where owner_user_id is null;

update public.recommendation_scan_runs
set owner_user_id = (select owner_user_id from ma05_operator_input)
where owner_user_id is null;

update public.recommendation_batches
set owner_user_id = (select owner_user_id from ma05_operator_input)
where owner_user_id is null;

update public.recommendation_outcomes
set owner_user_id = (select owner_user_id from ma05_operator_input)
where owner_user_id is null;

update public.execution_records
set user_id = (select owner_user_id from ma05_operator_input)
where user_id is null;

alter table public.recommendations validate constraint recommendations_owner_user_id_fkey;
alter table public.positions validate constraint positions_owner_user_id_fkey;
alter table public.position_updates validate constraint position_updates_owner_user_id_fkey;
alter table public.user_settings validate constraint user_settings_owner_user_id_fkey;
alter table public.recommendation_snapshots validate constraint recommendation_snapshots_owner_user_id_fkey;
alter table public.recommendation_scan_runs validate constraint recommendation_scan_runs_owner_user_id_fkey;
alter table public.recommendation_batches validate constraint recommendation_batches_owner_user_id_fkey;
alter table public.recommendation_outcomes validate constraint recommendation_outcomes_owner_user_id_fkey;
alter table public.execution_records validate constraint execution_records_user_id_fkey;

alter table public.recommendations validate constraint recommendations_owner_required_check;
alter table public.positions validate constraint positions_owner_required_check;
alter table public.position_updates validate constraint position_updates_owner_required_check;
alter table public.user_settings validate constraint user_settings_owner_required_check;
alter table public.recommendation_snapshots validate constraint recommendation_snapshots_owner_required_check;
alter table public.recommendation_scan_runs validate constraint recommendation_scan_runs_owner_required_check;
alter table public.recommendation_batches validate constraint recommendation_batches_owner_required_check;
alter table public.recommendation_outcomes validate constraint recommendation_outcomes_owner_required_check;
alter table public.execution_records validate constraint execution_records_user_required_check;

alter table public.positions validate constraint positions_recommendation_owner_fkey;
alter table public.position_updates validate constraint position_updates_position_owner_fkey;

alter table public.recommendations alter column owner_user_id set not null;
alter table public.positions alter column owner_user_id set not null;
alter table public.position_updates alter column owner_user_id set not null;
alter table public.user_settings alter column owner_user_id set not null;
alter table public.recommendation_snapshots alter column owner_user_id set not null;
alter table public.recommendation_scan_runs alter column owner_user_id set not null;
alter table public.recommendation_batches alter column owner_user_id set not null;
alter table public.recommendation_outcomes alter column owner_user_id set not null;
alter table public.execution_records alter column user_id set not null;

do $$
declare
  v_owner_user_id uuid;
  v_count_mismatch integer;
begin
  select owner_user_id into strict v_owner_user_id from ma05_operator_input;

  if exists (
    select 1 from public.recommendations where owner_user_id <> v_owner_user_id
    union all select 1 from public.positions where owner_user_id <> v_owner_user_id
    union all select 1 from public.position_updates where owner_user_id <> v_owner_user_id
    union all select 1 from public.user_settings where owner_user_id <> v_owner_user_id
    union all select 1 from public.recommendation_snapshots where owner_user_id <> v_owner_user_id
    union all select 1 from public.recommendation_scan_runs where owner_user_id <> v_owner_user_id
    union all select 1 from public.recommendation_batches where owner_user_id <> v_owner_user_id
    union all select 1 from public.recommendation_outcomes where owner_user_id <> v_owner_user_id
    union all select 1 from public.execution_records where user_id <> v_owner_user_id
  ) then
    raise exception 'ma05_post_backfill_owner_mismatch';
  end if;

  select count(*) into v_count_mismatch
  from ma05_pre_counts pre
  join (
    select 'recommendations' as table_name, count(*)::bigint as row_count from public.recommendations
    union all select 'positions', count(*)::bigint from public.positions
    union all select 'position_updates', count(*)::bigint from public.position_updates
    union all select 'user_settings', count(*)::bigint from public.user_settings
    union all select 'recommendation_snapshots', count(*)::bigint from public.recommendation_snapshots
    union all select 'recommendation_scan_runs', count(*)::bigint from public.recommendation_scan_runs
    union all select 'recommendation_batches', count(*)::bigint from public.recommendation_batches
    union all select 'recommendation_outcomes', count(*)::bigint from public.recommendation_outcomes
    union all select 'execution_records', count(*)::bigint from public.execution_records
  ) post using (table_name)
  where pre.row_count <> post.row_count;

  if v_count_mismatch <> 0 then
    raise exception 'ma05_row_count_reconciliation_failed';
  end if;
end;
$$;

select
  pre.table_name,
  pre.row_count,
  true as row_count_reconciled,
  true as explicit_owner_reconciled
from ma05_pre_counts pre
order by pre.table_name;

commit;
