-- IF-2b: durable catalog progress is not a coherent provider snapshot unless
-- every stored page attests the same provider-issued source snapshot identity.
-- This is additive hardening for a separately authorized future collector. It
-- does not make a provider request, admit discovery, ranking, publication,
-- execution, candidate or broker behavior.
begin;

alter table public.basic_free_catalog_collections
  add column if not exists provider_snapshot_id text;
alter table public.basic_free_catalog_collection_pages
  add column if not exists provider_snapshot_id text;

alter table public.basic_free_catalog_collections
  drop constraint if exists basic_free_catalog_collections_contract_check;
alter table public.basic_free_catalog_collections
  add constraint basic_free_catalog_collections_contract_check
    check (
      contract_version in (
        'basic_free_catalog_collection_checkpoint_v1',
        'basic_free_catalog_collection_checkpoint_v2'
      )
    );
alter table public.basic_free_catalog_collections
  add constraint basic_free_catalog_collections_provider_snapshot_id_check
    check (
      provider_snapshot_id is null
      or (
        provider_snapshot_id = btrim(provider_snapshot_id)
        and length(provider_snapshot_id) between 1 and 240
      )
    );
alter table public.basic_free_catalog_collection_pages
  add constraint basic_free_catalog_collection_pages_provider_snapshot_id_check
    check (
      provider_snapshot_id is null
      or (
        provider_snapshot_id = btrim(provider_snapshot_id)
        and length(provider_snapshot_id) between 1 and 240
      )
    );

alter table public.basic_free_catalog_collections enable row level security;
alter table public.basic_free_catalog_collection_pages enable row level security;
revoke all on table public.basic_free_catalog_collections
  from public, anon, authenticated, service_role;
revoke all on table public.basic_free_catalog_collection_pages
  from public, anon, authenticated, service_role;

drop function if exists public.start_basic_free_catalog_collection(
  text, uuid, integer, smallint, timestamptz, text
);
drop function if exists public.record_basic_free_catalog_collection_page(
  uuid, uuid, integer, integer, jsonb, timestamptz, text
);
drop function if exists public.read_basic_free_catalog_collection_checkpoint(
  text, uuid, text
);

create function public.start_basic_free_catalog_collection(
  p_collection_fingerprint text,
  p_owner_user_id uuid,
  p_provider_catalog_count integer,
  p_provider_snapshot_id text,
  p_page_size smallint,
  p_snapshot_observed_at timestamptz,
  p_expected_contract_version text
)
returns table (
  collection_status text,
  collection_id uuid,
  idempotent boolean,
  next_page integer,
  total_pages integer,
  completed_page_count integer,
  collected_record_count integer,
  blocker text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  existing public.basic_free_catalog_collections%rowtype;
  active_collection public.basic_free_catalog_collections%rowtype;
  calculated_total_pages integer;
begin
  if p_expected_contract_version <> 'basic_free_catalog_collection_checkpoint_v2'
     or p_collection_fingerprint is null
     or p_owner_user_id is null
     or p_provider_catalog_count not between 1 and 1000000
     or p_provider_snapshot_id is null
     or p_provider_snapshot_id <> btrim(p_provider_snapshot_id)
     or length(p_provider_snapshot_id) not between 1 and 240
     or p_page_size <> 8
     or p_snapshot_observed_at is null
     or p_snapshot_observed_at > now() + interval '5 minutes'
     or length(p_collection_fingerprint) not between 1 and 240 then
    return query select 'unavailable'::text, null::uuid, false, null::integer,
      null::integer, null::integer, null::integer,
      'collection_checkpoint_contract_invalid'::text;
    return;
  end if;

  perform pg_advisory_xact_lock(
    hashtext('basic_free_catalog_collection:owner:' || p_owner_user_id::text)
  );

  select * into existing
  from public.basic_free_catalog_collections
  where collection_fingerprint = p_collection_fingerprint
  for update;

  if found then
    if existing.owner_user_id = p_owner_user_id
       and existing.provider_catalog_count = p_provider_catalog_count
       and existing.provider_snapshot_id = p_provider_snapshot_id
       and existing.page_size = p_page_size
       and existing.snapshot_observed_at = p_snapshot_observed_at
       and existing.contract_version = p_expected_contract_version then
      return query select 'collection_available'::text, existing.id, true,
        existing.next_page, existing.total_pages, existing.completed_page_count,
        existing.collected_record_count, null::text;
    else
      return query select 'unavailable'::text, null::uuid, false, null::integer,
        null::integer, null::integer, null::integer,
        'collection_fingerprint_conflict'::text;
    end if;
    return;
  end if;

  select * into active_collection
  from public.basic_free_catalog_collections
  where owner_user_id = p_owner_user_id
    and status = 'collecting'
  for update;

  if found then
    return query select 'collection_already_in_progress'::text,
      active_collection.id, false, active_collection.next_page,
      active_collection.total_pages, active_collection.completed_page_count,
      active_collection.collected_record_count,
      'collection_already_in_progress'::text;
    return;
  end if;

  calculated_total_pages :=
    (p_provider_catalog_count + p_page_size - 1) / p_page_size;

  insert into public.basic_free_catalog_collections (
    contract_version,
    collection_fingerprint,
    owner_user_id,
    page_size,
    provider_catalog_count,
    provider_snapshot_id,
    total_pages,
    snapshot_observed_at
  ) values (
    p_expected_contract_version,
    p_collection_fingerprint,
    p_owner_user_id,
    p_page_size,
    p_provider_catalog_count,
    p_provider_snapshot_id,
    calculated_total_pages,
    p_snapshot_observed_at
  )
  returning * into existing;

  return query select 'collection_started'::text, existing.id, false,
    existing.next_page, existing.total_pages, existing.completed_page_count,
    existing.collected_record_count, null::text;
end;
$$;

create function public.record_basic_free_catalog_collection_page(
  p_collection_id uuid,
  p_owner_user_id uuid,
  p_page_number integer,
  p_provider_catalog_count integer,
  p_provider_snapshot_id text,
  p_raw_records jsonb,
  p_observed_at timestamptz,
  p_expected_contract_version text
)
returns table (
  page_status text,
  collection_status text,
  next_page integer,
  completed_page_count integer,
  collected_record_count integer,
  collection_complete boolean,
  blocker text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  collection_row public.basic_free_catalog_collections%rowtype;
  existing_page public.basic_free_catalog_collection_pages%rowtype;
  raw_record_count integer;
  expected_record_count integer;
  next_completed_page_count integer;
  next_collected_record_count integer;
  next_collection_status text;
begin
  if p_expected_contract_version <> 'basic_free_catalog_collection_checkpoint_v2'
     or p_collection_id is null
     or p_owner_user_id is null
     or p_page_number is null
     or p_page_number < 1
     or p_provider_catalog_count not between 1 and 1000000
     or p_provider_snapshot_id is null
     or p_provider_snapshot_id <> btrim(p_provider_snapshot_id)
     or length(p_provider_snapshot_id) not between 1 and 240
     or p_raw_records is null
     or jsonb_typeof(p_raw_records) <> 'array'
     or p_observed_at is null
     or p_observed_at > now() + interval '5 minutes' then
    return query select 'unavailable'::text, 'unavailable'::text,
      null::integer, null::integer, null::integer, false,
      'collection_page_contract_invalid'::text;
    return;
  end if;

  raw_record_count := jsonb_array_length(p_raw_records);
  if raw_record_count not between 1 and 8
     or pg_column_size(p_raw_records) > 65536
     or exists (
       select 1
       from jsonb_array_elements(p_raw_records) as raw_record(value)
       where jsonb_typeof(raw_record.value) <> 'object'
     ) then
    return query select 'unavailable'::text, 'unavailable'::text,
      null::integer, null::integer, null::integer, false,
      'collection_page_records_invalid'::text;
    return;
  end if;

  select * into collection_row
  from public.basic_free_catalog_collections
  where id = p_collection_id
    and owner_user_id = p_owner_user_id
  for update;

  if not found
     or collection_row.contract_version <> p_expected_contract_version then
    return query select 'unavailable'::text, 'unavailable'::text,
      null::integer, null::integer, null::integer, false,
      'collection_identity_unavailable'::text;
    return;
  end if;

  if collection_row.provider_snapshot_id is null then
    return query select 'unavailable'::text, collection_row.status,
      collection_row.next_page, collection_row.completed_page_count,
      collection_row.collected_record_count, collection_row.status = 'complete',
      'collection_snapshot_identity_missing'::text;
    return;
  end if;

  if p_provider_snapshot_id <> collection_row.provider_snapshot_id then
    return query select 'unavailable'::text, collection_row.status,
      collection_row.next_page, collection_row.completed_page_count,
      collection_row.collected_record_count, collection_row.status = 'complete',
      'collection_page_snapshot_identity_inconsistent'::text;
    return;
  end if;

  if p_provider_catalog_count <> collection_row.provider_catalog_count then
    return query select 'unavailable'::text, collection_row.status,
      collection_row.next_page, collection_row.completed_page_count,
      collection_row.collected_record_count, collection_row.status = 'complete',
      'collection_denominator_changed'::text;
    return;
  end if;

  if p_observed_at < collection_row.snapshot_observed_at then
    return query select 'unavailable'::text, collection_row.status,
      collection_row.next_page, collection_row.completed_page_count,
      collection_row.collected_record_count, collection_row.status = 'complete',
      'collection_page_precedes_snapshot'::text;
    return;
  end if;

  if p_page_number < collection_row.next_page then
    select * into existing_page
    from public.basic_free_catalog_collection_pages
    where collection_id = collection_row.id
      and page_number = p_page_number;

    if found
       and existing_page.provider_catalog_count = p_provider_catalog_count
       and existing_page.provider_snapshot_id = p_provider_snapshot_id
       and existing_page.raw_records = p_raw_records then
      return query select 'page_already_recorded'::text, collection_row.status,
        collection_row.next_page, collection_row.completed_page_count,
        collection_row.collected_record_count, collection_row.status = 'complete',
        null::text;
      return;
    end if;

    return query select 'unavailable'::text, collection_row.status,
      collection_row.next_page, collection_row.completed_page_count,
      collection_row.collected_record_count, collection_row.status = 'complete',
      'collection_page_conflict'::text;
    return;
  end if;

  if collection_row.status <> 'collecting' then
    return query select 'collection_complete'::text, collection_row.status,
      collection_row.next_page, collection_row.completed_page_count,
      collection_row.collected_record_count, true,
      'collection_already_complete'::text;
    return;
  end if;

  if p_page_number <> collection_row.next_page then
    return query select 'unavailable'::text, collection_row.status,
      collection_row.next_page, collection_row.completed_page_count,
      collection_row.collected_record_count, false,
      'collection_page_sequence_gap'::text;
    return;
  end if;

  expected_record_count := least(
    collection_row.page_size,
    collection_row.provider_catalog_count -
      ((p_page_number - 1) * collection_row.page_size)
  );
  if p_page_number > collection_row.total_pages
     or raw_record_count <> expected_record_count then
    return query select 'unavailable'::text, collection_row.status,
      collection_row.next_page, collection_row.completed_page_count,
      collection_row.collected_record_count, false,
      'collection_page_record_count_invalid'::text;
    return;
  end if;

  next_completed_page_count := collection_row.completed_page_count + 1;
  next_collected_record_count :=
    collection_row.collected_record_count + raw_record_count;
  next_collection_status := case
    when next_completed_page_count = collection_row.total_pages
         and next_collected_record_count = collection_row.provider_catalog_count
      then 'complete'
    else 'collecting'
  end;

  insert into public.basic_free_catalog_collection_pages (
    collection_id,
    page_number,
    provider_catalog_count,
    provider_snapshot_id,
    record_count,
    raw_records,
    observed_at
  ) values (
    collection_row.id,
    p_page_number,
    p_provider_catalog_count,
    p_provider_snapshot_id,
    raw_record_count,
    p_raw_records,
    p_observed_at
  );

  update public.basic_free_catalog_collections
  set status = next_collection_status,
      next_page = collection_row.next_page + 1,
      completed_page_count = next_completed_page_count,
      collected_record_count = next_collected_record_count,
      last_page_observed_at = p_observed_at,
      completed_at = case
        when next_collection_status = 'complete' then p_observed_at
        else null
      end,
      updated_at = now()
  where id = collection_row.id;

  return query select 'page_recorded'::text, next_collection_status,
    collection_row.next_page + 1, next_completed_page_count,
    next_collected_record_count, next_collection_status = 'complete', null::text;
end;
$$;

create function public.read_basic_free_catalog_collection_checkpoint(
  p_collection_fingerprint text,
  p_owner_user_id uuid,
  p_expected_contract_version text
)
returns table (
  readback_status text,
  collection_id uuid,
  collection_status text,
  provider_catalog_count integer,
  page_size smallint,
  total_pages integer,
  next_page integer,
  completed_page_count integer,
  collected_record_count integer,
  provider_snapshot_id text,
  snapshot_observed_at timestamptz,
  last_page_observed_at timestamptz,
  completed_at timestamptz,
  blocker text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  collection_row public.basic_free_catalog_collections%rowtype;
begin
  if p_expected_contract_version <> 'basic_free_catalog_collection_checkpoint_v2'
     or p_collection_fingerprint is null
     or p_owner_user_id is null
     or length(p_collection_fingerprint) not between 1 and 240 then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::integer, null::smallint, null::integer, null::integer,
      null::integer, null::integer, null::text, null::timestamptz,
      null::timestamptz, null::timestamptz,
      'collection_checkpoint_contract_invalid'::text;
    return;
  end if;

  select * into collection_row
  from public.basic_free_catalog_collections
  where collection_fingerprint = p_collection_fingerprint
    and owner_user_id = p_owner_user_id;

  if not found then
    return query select 'not_found'::text, null::uuid, null::text,
      null::integer, null::smallint, null::integer, null::integer,
      null::integer, null::integer, null::text, null::timestamptz,
      null::timestamptz, null::timestamptz,
      'collection_checkpoint_not_found'::text;
    return;
  end if;

  if collection_row.contract_version <> p_expected_contract_version then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::integer, null::smallint, null::integer, null::integer,
      null::integer, null::integer, null::text, null::timestamptz,
      null::timestamptz, null::timestamptz,
      'collection_checkpoint_contract_incompatible'::text;
    return;
  end if;

  if collection_row.provider_snapshot_id is null then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::integer, null::smallint, null::integer, null::integer,
      null::integer, null::integer, null::text, null::timestamptz,
      null::timestamptz, null::timestamptz,
      'collection_snapshot_identity_missing'::text;
    return;
  end if;

  return query select 'available'::text, collection_row.id,
    collection_row.status, collection_row.provider_catalog_count,
    collection_row.page_size, collection_row.total_pages,
    collection_row.next_page, collection_row.completed_page_count,
    collection_row.collected_record_count, collection_row.provider_snapshot_id,
    collection_row.snapshot_observed_at, collection_row.last_page_observed_at,
    collection_row.completed_at, null::text;
end;
$$;

revoke all on function public.start_basic_free_catalog_collection(
  text, uuid, integer, text, smallint, timestamptz, text
) from public, anon, authenticated, service_role;
revoke all on function public.record_basic_free_catalog_collection_page(
  uuid, uuid, integer, integer, text, jsonb, timestamptz, text
) from public, anon, authenticated, service_role;
revoke all on function public.read_basic_free_catalog_collection_checkpoint(
  text, uuid, text
) from public, anon, authenticated, service_role;
grant execute on function public.start_basic_free_catalog_collection(
  text, uuid, integer, text, smallint, timestamptz, text
) to service_role;
grant execute on function public.record_basic_free_catalog_collection_page(
  uuid, uuid, integer, integer, text, jsonb, timestamptz, text
) to service_role;
grant execute on function public.read_basic_free_catalog_collection_checkpoint(
  text, uuid, text
) to service_role;

comment on table public.basic_free_catalog_collections is
  'Server-only IF-2b Basic Free catalog collection checkpoints. A v2 checkpoint requires one provider-issued snapshot identity across every durable page; missing or inconsistent lineage cannot itself admit discovery, ranking, publication, execution or a provider request.';
comment on table public.basic_free_catalog_collection_pages is
  'Server-only raw provider-page lineage for a v2 IF-2b Basic Free catalog checkpoint. Each page must retain the checkpoint provider snapshot identity; no client or discovery-feed access is granted.';

commit;
