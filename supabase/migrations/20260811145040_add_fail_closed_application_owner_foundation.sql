-- MA05 source-only owner foundation.
--
-- This migration is deliberately additive and does not backfill or infer an
-- owner. Existing rows stay unowned until a separate, operator-approved
-- production action supplies the canonical auth.users id and verifies the
-- result. Application code must not be deployed before that activation gate.

alter table public.recommendations
  add column if not exists owner_user_id uuid null;
alter table public.positions
  add column if not exists owner_user_id uuid null;
alter table public.position_updates
  add column if not exists owner_user_id uuid null;
alter table public.user_settings
  add column if not exists owner_user_id uuid null;
alter table public.recommendation_snapshots
  add column if not exists owner_user_id uuid null;
alter table public.recommendation_scan_runs
  add column if not exists owner_user_id uuid null;
alter table public.recommendation_batches
  add column if not exists owner_user_id uuid null;
alter table public.recommendation_outcomes
  add column if not exists owner_user_id uuid null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'recommendations_owner_user_id_fkey'
      and conrelid = 'public.recommendations'::regclass
  ) then
    alter table public.recommendations
      add constraint recommendations_owner_user_id_fkey
      foreign key (owner_user_id) references auth.users(id)
      on delete restrict not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'positions_owner_user_id_fkey'
      and conrelid = 'public.positions'::regclass
  ) then
    alter table public.positions
      add constraint positions_owner_user_id_fkey
      foreign key (owner_user_id) references auth.users(id)
      on delete restrict not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'position_updates_owner_user_id_fkey'
      and conrelid = 'public.position_updates'::regclass
  ) then
    alter table public.position_updates
      add constraint position_updates_owner_user_id_fkey
      foreign key (owner_user_id) references auth.users(id)
      on delete restrict not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'user_settings_owner_user_id_fkey'
      and conrelid = 'public.user_settings'::regclass
  ) then
    alter table public.user_settings
      add constraint user_settings_owner_user_id_fkey
      foreign key (owner_user_id) references auth.users(id)
      on delete restrict not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'recommendation_snapshots_owner_user_id_fkey'
      and conrelid = 'public.recommendation_snapshots'::regclass
  ) then
    alter table public.recommendation_snapshots
      add constraint recommendation_snapshots_owner_user_id_fkey
      foreign key (owner_user_id) references auth.users(id)
      on delete restrict not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'recommendation_scan_runs_owner_user_id_fkey'
      and conrelid = 'public.recommendation_scan_runs'::regclass
  ) then
    alter table public.recommendation_scan_runs
      add constraint recommendation_scan_runs_owner_user_id_fkey
      foreign key (owner_user_id) references auth.users(id)
      on delete restrict not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'recommendation_batches_owner_user_id_fkey'
      and conrelid = 'public.recommendation_batches'::regclass
  ) then
    alter table public.recommendation_batches
      add constraint recommendation_batches_owner_user_id_fkey
      foreign key (owner_user_id) references auth.users(id)
      on delete restrict not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'recommendation_outcomes_owner_user_id_fkey'
      and conrelid = 'public.recommendation_outcomes'::regclass
  ) then
    alter table public.recommendation_outcomes
      add constraint recommendation_outcomes_owner_user_id_fkey
      foreign key (owner_user_id) references auth.users(id)
      on delete restrict not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'execution_records_user_id_fkey'
      and conrelid = 'public.execution_records'::regclass
  ) then
    alter table public.execution_records
      add constraint execution_records_user_id_fkey
      foreign key (user_id) references auth.users(id)
      on delete restrict not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'recommendations_owner_required_check'
      and conrelid = 'public.recommendations'::regclass
  ) then
    alter table public.recommendations
      add constraint recommendations_owner_required_check
      check (owner_user_id is not null) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'positions_owner_required_check'
      and conrelid = 'public.positions'::regclass
  ) then
    alter table public.positions
      add constraint positions_owner_required_check
      check (owner_user_id is not null) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'position_updates_owner_required_check'
      and conrelid = 'public.position_updates'::regclass
  ) then
    alter table public.position_updates
      add constraint position_updates_owner_required_check
      check (owner_user_id is not null) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'user_settings_owner_required_check'
      and conrelid = 'public.user_settings'::regclass
  ) then
    alter table public.user_settings
      add constraint user_settings_owner_required_check
      check (owner_user_id is not null) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'recommendation_snapshots_owner_required_check'
      and conrelid = 'public.recommendation_snapshots'::regclass
  ) then
    alter table public.recommendation_snapshots
      add constraint recommendation_snapshots_owner_required_check
      check (owner_user_id is not null) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'recommendation_scan_runs_owner_required_check'
      and conrelid = 'public.recommendation_scan_runs'::regclass
  ) then
    alter table public.recommendation_scan_runs
      add constraint recommendation_scan_runs_owner_required_check
      check (owner_user_id is not null) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'recommendation_batches_owner_required_check'
      and conrelid = 'public.recommendation_batches'::regclass
  ) then
    alter table public.recommendation_batches
      add constraint recommendation_batches_owner_required_check
      check (owner_user_id is not null) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'recommendation_outcomes_owner_required_check'
      and conrelid = 'public.recommendation_outcomes'::regclass
  ) then
    alter table public.recommendation_outcomes
      add constraint recommendation_outcomes_owner_required_check
      check (owner_user_id is not null) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'execution_records_user_required_check'
      and conrelid = 'public.execution_records'::regclass
  ) then
    alter table public.execution_records
      add constraint execution_records_user_required_check
      check (user_id is not null) not valid;
  end if;
end;
$$;

create index if not exists recommendations_owner_created_at_idx
  on public.recommendations (owner_user_id, created_at desc);
create unique index if not exists recommendations_id_owner_user_id_uidx
  on public.recommendations (id, owner_user_id);
create index if not exists positions_owner_status_created_at_idx
  on public.positions (owner_user_id, status, created_at desc);
create unique index if not exists positions_id_owner_user_id_uidx
  on public.positions (id, owner_user_id);
create index if not exists position_updates_owner_created_at_idx
  on public.position_updates (owner_user_id, created_at desc);
create unique index if not exists user_settings_one_row_per_owner_uidx
  on public.user_settings (owner_user_id)
  where owner_user_id is not null;
create index if not exists recommendation_snapshots_owner_created_at_idx
  on public.recommendation_snapshots (owner_user_id, created_at desc);
create index if not exists recommendation_scan_runs_owner_observed_at_idx
  on public.recommendation_scan_runs (owner_user_id, observed_at desc);
create index if not exists recommendation_batches_owner_published_at_idx
  on public.recommendation_batches (owner_user_id, published_at desc);
create index if not exists recommendation_batches_owner_scan_run_idx
  on public.recommendation_batches (owner_user_id, scan_run_fingerprint);
create index if not exists recommendation_outcomes_owner_evaluated_at_idx
  on public.recommendation_outcomes (owner_user_id, evaluated_at desc);
create index if not exists recommendation_outcomes_owner_snapshot_idx
  on public.recommendation_outcomes (owner_user_id, snapshot_fingerprint);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'positions_recommendation_owner_fkey'
      and conrelid = 'public.positions'::regclass
  ) then
    alter table public.positions
      add constraint positions_recommendation_owner_fkey
      foreign key (recommendation_id, owner_user_id)
      references public.recommendations(id, owner_user_id)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'position_updates_position_owner_fkey'
      and conrelid = 'public.position_updates'::regclass
  ) then
    alter table public.position_updates
      add constraint position_updates_position_owner_fkey
      foreign key (position_id, owner_user_id)
      references public.positions(id, owner_user_id)
      on delete cascade not valid;
  end if;
end;
$$;

alter table public.recommendations enable row level security;
alter table public.positions enable row level security;
alter table public.position_updates enable row level security;
alter table public.user_settings enable row level security;
alter table public.recommendation_snapshots enable row level security;
alter table public.recommendation_scan_runs enable row level security;
alter table public.recommendation_batches enable row level security;
alter table public.recommendation_outcomes enable row level security;
alter table public.execution_records enable row level security;

revoke all privileges on table public.recommendations from public, anon, authenticated;
revoke all privileges on table public.positions from public, anon, authenticated;
revoke all privileges on table public.position_updates from public, anon, authenticated;
revoke all privileges on table public.user_settings from public, anon, authenticated;
revoke all privileges on table public.recommendation_snapshots from public, anon, authenticated;
revoke all privileges on table public.recommendation_scan_runs from public, anon, authenticated;
revoke all privileges on table public.recommendation_batches from public, anon, authenticated;
revoke all privileges on table public.recommendation_outcomes from public, anon, authenticated;
revoke all privileges on table public.execution_records from public, anon, authenticated;

-- Do not rely only on the earlier containment migration. Remove every legacy
-- policy on owner-bound tables so a later table grant cannot reactivate a
-- permissive policy that predates MA05.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'recommendations',
        'positions',
        'position_updates',
        'user_settings',
        'recommendation_snapshots',
        'recommendation_scan_runs',
        'recommendation_batches',
        'recommendation_outcomes',
        'execution_records'
      ])
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end;
$$;

drop policy if exists application_owner_access on public.recommendations;
create policy application_owner_access on public.recommendations
  for select to authenticated
  using ((select auth.uid()) = owner_user_id);

drop policy if exists application_owner_access on public.positions;
create policy application_owner_access on public.positions
  for select to authenticated
  using ((select auth.uid()) = owner_user_id);

drop policy if exists application_owner_access on public.position_updates;
create policy application_owner_access on public.position_updates
  for select to authenticated
  using ((select auth.uid()) = owner_user_id);

drop policy if exists application_owner_access on public.user_settings;
create policy application_owner_access on public.user_settings
  for select to authenticated
  using ((select auth.uid()) = owner_user_id);

drop policy if exists application_owner_access on public.recommendation_snapshots;
create policy application_owner_access on public.recommendation_snapshots
  for select to authenticated
  using ((select auth.uid()) = owner_user_id);

drop policy if exists application_owner_access on public.recommendation_scan_runs;
create policy application_owner_access on public.recommendation_scan_runs
  for select to authenticated
  using ((select auth.uid()) = owner_user_id);

drop policy if exists application_owner_access on public.recommendation_batches;
create policy application_owner_access on public.recommendation_batches
  for select to authenticated
  using ((select auth.uid()) = owner_user_id);

drop policy if exists application_owner_access on public.recommendation_outcomes;
create policy application_owner_access on public.recommendation_outcomes
  for select to authenticated
  using ((select auth.uid()) = owner_user_id);

drop policy if exists application_owner_access on public.execution_records;
create policy application_owner_access on public.execution_records
  for select to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.app_open_owned_position_transaction(
  p_owner_user_id uuid,
  p_recommendation_id uuid,
  p_ticker text,
  p_company_name text,
  p_entry_price numeric,
  p_position_size numeric,
  p_current_stop numeric,
  p_target_1 numeric,
  p_target_2 numeric,
  p_execution_metadata jsonb,
  p_command_version text
)
returns table (
  position_id uuid,
  disposition text,
  snapshot_link_count integer
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_recommendation public.recommendations%rowtype;
  v_existing_position public.positions%rowtype;
  v_existing_position_count integer;
  v_snapshot_link_count integer := 0;
  v_position_id uuid;
begin
  if p_command_version <> 'application_open_owned_position_v1'
    or p_owner_user_id is null
    or not exists (select 1 from auth.users where id = p_owner_user_id)
    or p_recommendation_id is null
    or p_ticker !~ '^[A-Z.]{1,16}$'
    or coalesce(length(p_company_name), 0) > 240
    or p_entry_price is null or p_entry_price <= 0
    or p_position_size is null or p_position_size <= 0
    or p_current_stop is null or p_current_stop <= 0
    or p_target_1 is null or p_target_1 <= 0
    or p_target_2 is null or p_target_2 <= 0
    or (p_execution_metadata is not null and jsonb_typeof(p_execution_metadata) <> 'object')
  then
    raise exception 'invalid_open_owned_position_command';
  end if;

  select * into v_recommendation
  from public.recommendations
  where id = p_recommendation_id
    and owner_user_id = p_owner_user_id
  for update;

  if not found then
    raise exception 'owned_recommendation_not_found';
  end if;

  if v_recommendation.ticker <> p_ticker
    or v_recommendation.status not in ('new', 'watched', 'taken')
  then
    raise exception 'recommendation_not_eligible_for_open_position';
  end if;

  select count(*) into v_existing_position_count
  from public.positions
  where recommendation_id = p_recommendation_id
    and owner_user_id = p_owner_user_id;

  if v_existing_position_count > 1 then
    raise exception 'recommendation_position_linkage_inconsistent';
  end if;

  if v_existing_position_count = 1 then
    select * into v_existing_position
    from public.positions
    where recommendation_id = p_recommendation_id
      and owner_user_id = p_owner_user_id
    for update;

    if v_existing_position.ticker is distinct from p_ticker
      or v_existing_position.company_name is distinct from p_company_name
      or v_existing_position.entry_price is distinct from p_entry_price
      or v_existing_position.position_size is distinct from p_position_size
      or v_existing_position.current_stop is distinct from p_current_stop
      or v_existing_position.target_1 is distinct from p_target_1
      or v_existing_position.target_2 is distinct from p_target_2
      or v_existing_position.execution_metadata is distinct from p_execution_metadata
      or v_existing_position.status is distinct from 'open'
      or v_recommendation.status is distinct from 'taken'
    then
      raise exception 'open_owned_position_command_conflict';
    end if;

    v_position_id := v_existing_position.id;
    disposition := 'reused';
  else
    if v_recommendation.status = 'taken' then
      raise exception 'recommendation_taken_without_owned_position';
    end if;

    insert into public.positions (
      owner_user_id,
      recommendation_id,
      ticker,
      company_name,
      entry_price,
      position_size,
      current_stop,
      target_1,
      target_2,
      status,
      execution_metadata
    ) values (
      p_owner_user_id,
      p_recommendation_id,
      p_ticker,
      p_company_name,
      p_entry_price,
      p_position_size,
      p_current_stop,
      p_target_1,
      p_target_2,
      'open',
      p_execution_metadata
    )
    returning id into v_position_id;

    update public.recommendations
    set status = 'taken'
    where id = p_recommendation_id
      and owner_user_id = p_owner_user_id;

    disposition := 'created';
  end if;

  if exists (
    select 1
    from public.recommendation_snapshots
    where owner_user_id = p_owner_user_id
      and recommendation_id = p_recommendation_id::text
      and linked_position_id is not null
      and linked_position_id <> v_position_id::text
  ) then
    raise exception 'recommendation_snapshot_linkage_conflict';
  end if;

  update public.recommendation_snapshots
  set status = 'taken',
      was_taken = true,
      linked_position_id = v_position_id::text,
      updated_at = now()
  where owner_user_id = p_owner_user_id
    and recommendation_id = p_recommendation_id::text;

  get diagnostics v_snapshot_link_count = row_count;

  position_id := v_position_id;
  snapshot_link_count := v_snapshot_link_count;
  return next;
end;
$$;

revoke all on function public.app_open_position_transaction(
  uuid, text, text, numeric, numeric, numeric, numeric, numeric, jsonb, text
) from service_role;
revoke all on function public.app_open_owned_position_transaction(
  uuid, uuid, text, text, numeric, numeric, numeric, numeric, numeric, jsonb, text
) from public, anon, authenticated;
grant execute on function public.app_open_owned_position_transaction(
  uuid, uuid, text, text, numeric, numeric, numeric, numeric, numeric, jsonb, text
) to service_role;

comment on function public.app_open_owned_position_transaction(
  uuid, uuid, text, text, numeric, numeric, numeric, numeric, numeric, jsonb, text
) is 'MA05 server-only position command. The signed application owner is mandatory and every recommendation, position, and snapshot mutation is owner-scoped.';

comment on column public.recommendations.owner_user_id is
  'MA05 canonical auth.users owner. Nullable only until the separately approved legacy backfill and NOT NULL activation.';
comment on column public.positions.owner_user_id is
  'MA05 canonical auth.users owner. Never accepted from an application request body.';
comment on column public.position_updates.owner_user_id is
  'MA05 canonical auth.users owner inherited from the verified server session.';
comment on column public.user_settings.owner_user_id is
  'MA05 canonical auth.users owner. One settings row per non-null owner.';
comment on column public.recommendation_snapshots.owner_user_id is
  'MA05 canonical auth.users owner for recommendation-to-position lineage.';
comment on column public.recommendation_scan_runs.owner_user_id is
  'MA05 canonical auth.users owner for the visible recommendation set and its run diagnostics.';
comment on column public.recommendation_batches.owner_user_id is
  'MA05 canonical auth.users owner for each official or diagnostic recommendation batch.';
comment on column public.recommendation_outcomes.owner_user_id is
  'MA05 canonical auth.users owner inherited from the evaluated recommendation snapshot.';
comment on column public.execution_records.user_id is
  'MA05 canonical auth.users owner. Nullable only while execution persistence remains gated and legacy rows are reviewed.';
