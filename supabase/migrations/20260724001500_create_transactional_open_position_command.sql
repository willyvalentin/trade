-- Action 652C: the authenticated application opens a position through this
-- single bounded command. It deliberately does not restore browser table access.

create or replace function public.app_open_position_transaction(
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
  if p_command_version <> 'application_open_position_v1'
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
    raise exception 'invalid_open_position_command';
  end if;

  select * into v_recommendation
  from public.recommendations
  where id = p_recommendation_id
  for update;

  if not found then
    raise exception 'recommendation_not_found';
  end if;

  if v_recommendation.ticker <> p_ticker
    or v_recommendation.status not in ('new', 'watched', 'taken')
  then
    raise exception 'recommendation_not_eligible_for_open_position';
  end if;

  select count(*) into v_existing_position_count
  from public.positions
  where recommendation_id = p_recommendation_id;

  if v_existing_position_count > 1 then
    raise exception 'recommendation_position_linkage_inconsistent';
  end if;

  if v_existing_position_count = 1 then
    select * into v_existing_position
    from public.positions
    where recommendation_id = p_recommendation_id
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
      raise exception 'open_position_command_conflict';
    end if;

    v_position_id := v_existing_position.id;
    disposition := 'reused';
  else
    if v_recommendation.status = 'taken' then
      raise exception 'recommendation_taken_without_position';
    end if;

    insert into public.positions (
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
    where id = p_recommendation_id;

    disposition := 'created';
  end if;

  if exists (
    select 1
    from public.recommendation_snapshots
    where recommendation_id = p_recommendation_id::text
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
  where recommendation_id = p_recommendation_id::text;

  get diagnostics v_snapshot_link_count = row_count;

  position_id := v_position_id;
  snapshot_link_count := v_snapshot_link_count;
  return next;
end;
$$;

revoke all on function public.app_open_position_transaction(
  uuid, text, text, numeric, numeric, numeric, numeric, numeric, jsonb, text
) from public, anon, authenticated;
grant execute on function public.app_open_position_transaction(
  uuid, text, text, numeric, numeric, numeric, numeric, numeric, jsonb, text
) to service_role;

comment on function public.app_open_position_transaction(
  uuid, text, text, numeric, numeric, numeric, numeric, numeric, jsonb, text
) is 'Action 652C bounded transactional open-position command; recommendation lock makes retries idempotent and rejects conflicting commands.';
