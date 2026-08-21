-- Action 666DI: source-only append-only position-version history relation.
--
-- This migration creates schema only. It inserts no legacy or runtime data,
-- creates no writer, grants no client access and is not authorized for any
-- staging or production apply by Action 666DI itself.

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_class index_class
    join pg_catalog.pg_index index_record
      on index_record.indexrelid = index_class.oid
    join pg_catalog.pg_namespace index_namespace
      on index_namespace.oid = index_class.relnamespace
    where index_namespace.nspname = 'public'
      and index_record.indrelid = 'public.positions'::regclass
      and index_record.indisunique
      and index_record.indisvalid
      and index_record.indisready
      and index_record.indpred is null
      and index_record.indexprs is null
      and (
        select pg_catalog.array_agg(attribute_record.attname order by key_record.ordinality)
        from pg_catalog.unnest(index_record.indkey) with ordinality
          as key_record(attnum, ordinality)
        join pg_catalog.pg_attribute attribute_record
          on attribute_record.attrelid = index_record.indrelid
         and attribute_record.attnum = key_record.attnum
        where key_record.ordinality <= index_record.indnkeyatts
      ) = array['id', 'owner_user_id']::name[]
  ) then
    create unique index positions_id_owner_user_id_uidx
      on public.positions (id, owner_user_id);
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_class index_class
    join pg_catalog.pg_index index_record
      on index_record.indexrelid = index_class.oid
    join pg_catalog.pg_namespace index_namespace
      on index_namespace.oid = index_class.relnamespace
    where index_namespace.nspname = 'public'
      and index_record.indrelid = 'public.positions'::regclass
      and index_record.indisunique
      and index_record.indisvalid
      and index_record.indisready
      and index_record.indpred is null
      and index_record.indexprs is null
      and (
        select pg_catalog.array_agg(attribute_record.attname order by key_record.ordinality)
        from pg_catalog.unnest(index_record.indkey) with ordinality
          as key_record(attnum, ordinality)
        join pg_catalog.pg_attribute attribute_record
          on attribute_record.attrelid = index_record.indrelid
         and attribute_record.attnum = key_record.attnum
        where key_record.ordinality <= index_record.indnkeyatts
      ) = array['id', 'owner_user_id']::name[]
  ) then
    raise exception 'action_666di_positions_owner_parent_target_missing';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_class index_class
    join pg_catalog.pg_index index_record
      on index_record.indexrelid = index_class.oid
    join pg_catalog.pg_namespace index_namespace
      on index_namespace.oid = index_class.relnamespace
    where index_namespace.nspname = 'public'
      and index_record.indrelid = 'public.recommendations'::regclass
      and index_record.indisunique
      and index_record.indisvalid
      and index_record.indisready
      and index_record.indpred is null
      and index_record.indexprs is null
      and (
        select pg_catalog.array_agg(attribute_record.attname order by key_record.ordinality)
        from pg_catalog.unnest(index_record.indkey) with ordinality
          as key_record(attnum, ordinality)
        join pg_catalog.pg_attribute attribute_record
          on attribute_record.attrelid = index_record.indrelid
         and attribute_record.attnum = key_record.attnum
        where key_record.ordinality <= index_record.indnkeyatts
      ) = array['id', 'owner_user_id']::name[]
  ) then
    raise exception 'action_666di_recommendations_owner_parent_target_missing';
  end if;

  if to_regprocedure(
    'public.action_666di_reject_position_version_history_mutation()'
  ) is not null then
    raise exception 'action_666di_append_only_function_conflict';
  end if;
end;
$$;

create table public.position_version_history (
  position_id uuid not null,
  owner_user_id uuid not null,
  position_version bigint not null,
  recommendation_id uuid not null,
  durable_recommendation_version bigint not null,
  recommendation_identity text not null,
  recommendation_normative_digest text not null,
  position_state_frame jsonb not null,
  position_state_digest text not null,
  recorded_at timestamptz not null default now(),

  constraint position_version_history_pkey
    primary key (position_id, owner_user_id, position_version),
  constraint position_version_history_position_owner_fkey
    foreign key (position_id, owner_user_id)
    references public.positions (id, owner_user_id)
    on delete restrict,
  constraint position_version_history_recommendation_owner_fkey
    foreign key (recommendation_id, owner_user_id)
    references public.recommendations (id, owner_user_id)
    on delete restrict,
  constraint position_version_history_position_version_safe_range_check
    check (position_version between 1 and 9007199254740991),
  constraint position_version_history_durable_recommendation_version_safe_range_check
    check (durable_recommendation_version between 1 and 9007199254740991),
  constraint position_version_history_recommendation_identity_present_check
    check (length(btrim(recommendation_identity)) > 0),
  constraint position_version_history_recommendation_normative_digest_format_check
    check (recommendation_normative_digest ~ '^[0-9a-f]{64}$'),
  constraint position_version_history_position_state_frame_present_check
    check (jsonb_typeof(position_state_frame) = 'object'),
  constraint position_version_history_position_state_digest_format_check
    check (position_state_digest ~ '^[0-9a-f]{64}$')
);

create index position_version_history_recommendation_owner_idx
  on public.position_version_history (recommendation_id, owner_user_id);

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_class index_class
    join pg_catalog.pg_index index_record
      on index_record.indexrelid = index_class.oid
    join pg_catalog.pg_namespace index_namespace
      on index_namespace.oid = index_class.relnamespace
    where index_namespace.nspname = 'public'
      and index_class.relname = 'position_version_history_recommendation_owner_idx'
      and index_record.indrelid = 'public.position_version_history'::regclass
      and index_record.indisvalid
      and index_record.indisready
      and index_record.indpred is null
      and index_record.indexprs is null
      and (
        select pg_catalog.array_agg(attribute_record.attname order by key_record.ordinality)
        from pg_catalog.unnest(index_record.indkey) with ordinality
          as key_record(attnum, ordinality)
        join pg_catalog.pg_attribute attribute_record
          on attribute_record.attrelid = index_record.indrelid
         and attribute_record.attnum = key_record.attnum
        where key_record.ordinality <= index_record.indnkeyatts
      ) = array['recommendation_id', 'owner_user_id']::name[]
  ) then
    raise exception 'action_666di_recommendation_owner_index_invalid';
  end if;
end;
$$;

alter table public.position_version_history enable row level security;
revoke all privileges on table public.position_version_history
  from public, anon, authenticated;

do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'position_version_history'
  ) then
    raise exception 'action_666di_client_policy_conflict';
  end if;
end;
$$;

create function public.action_666di_reject_position_version_history_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  raise exception 'action_666di append-only history rejects % on %.%',
    tg_op,
    tg_table_schema,
    tg_table_name
    using errcode = '55000';
end;
$$;

revoke all on function public.action_666di_reject_position_version_history_mutation()
  from public, anon, authenticated;

create trigger action_666di_position_version_history_append_only
before update or delete on public.position_version_history
for each row
execute function public.action_666di_reject_position_version_history_mutation();
