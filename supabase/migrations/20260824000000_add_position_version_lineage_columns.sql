-- Action 666EE — additive durable-lineage schema only.
--
-- The migration intentionally contains no DML, no runtime function and no
-- privilege change. It leaves every new column nullable so the existing v1
-- command remains compatible until the separately reviewed owner-scoped
-- deterministic backfill and v2 command-port rollout are complete.

alter table public.recommendations
  add column if not exists recommendation_version bigint null,
  add column if not exists recommendation_identity text null,
  add column if not exists recommendation_normative_digest text null;

alter table public.positions
  add column if not exists position_version bigint null,
  add column if not exists durable_recommendation_version bigint null,
  add column if not exists recommendation_identity text null,
  add column if not exists recommendation_normative_digest text null;

-- Fail closed if an already-present column has a divergent physical shape.
-- The columns must stay nullable in this deployment unit: physical NOT NULL
-- activation is prohibited until the deterministic backfill has a fresh,
-- zero-blocker aggregate reconciliation.
do $$
declare
  lineage_column record;
begin
  for lineage_column in
    select *
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
  loop
    if not exists (
      select 1
      from pg_catalog.pg_attribute attribute_record
      where attribute_record.attrelid = lineage_column.relation_id
        and attribute_record.attname = lineage_column.column_name
        and attribute_record.atttypid = lineage_column.type_id
        and not attribute_record.attnotnull
        and attribute_record.attnum > 0
        and not attribute_record.attisdropped
    ) then
      raise exception 'action_666ee_lineage_column_shape_mismatch: %.%',
        lineage_column.relation_id::pg_catalog.regclass,
        lineage_column.column_name;
    end if;
  end loop;
end;
$$;

-- The constraints deliberately accept an all-null lineage tuple while v1 is
-- still the live command. They reject partial tuples and malformed values for
-- every newly written durable tuple. Validation and physical NOT NULL remain
-- separate, bounded operations after the deterministic owner-scoped backfill.
do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.recommendations'::regclass
      and conname = 'recommendations_recommendation_version_safe_range_check'
  ) then
    alter table public.recommendations
      add constraint recommendations_recommendation_version_safe_range_check
      check (
        recommendation_version is null
        or recommendation_version between 1 and 9007199254740991
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.recommendations'::regclass
      and conname = 'recommendations_recommendation_identity_present_check'
  ) then
    alter table public.recommendations
      add constraint recommendations_recommendation_identity_present_check
      check (
        recommendation_identity is null
        or length(btrim(recommendation_identity)) > 0
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.recommendations'::regclass
      and conname = 'recommendations_recommendation_normative_digest_format_check'
  ) then
    alter table public.recommendations
      add constraint recommendations_recommendation_normative_digest_format_check
      check (
        recommendation_normative_digest is null
        or recommendation_normative_digest ~ '^[0-9a-f]{64}$'
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.recommendations'::regclass
      and conname = 'recommendations_lineage_tuple_complete_check'
  ) then
    alter table public.recommendations
      add constraint recommendations_lineage_tuple_complete_check
      check (
        (recommendation_version is null
          and recommendation_identity is null
          and recommendation_normative_digest is null)
        or (recommendation_version is not null
          and recommendation_identity is not null
          and recommendation_normative_digest is not null)
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.positions'::regclass
      and conname = 'positions_position_version_safe_range_check'
  ) then
    alter table public.positions
      add constraint positions_position_version_safe_range_check
      check (
        position_version is null
        or position_version between 1 and 9007199254740991
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.positions'::regclass
      and conname = 'positions_durable_recommendation_version_safe_range_check'
  ) then
    alter table public.positions
      add constraint positions_durable_recommendation_version_safe_range_check
      check (
        durable_recommendation_version is null
        or durable_recommendation_version between 1 and 9007199254740991
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.positions'::regclass
      and conname = 'positions_recommendation_identity_present_check'
  ) then
    alter table public.positions
      add constraint positions_recommendation_identity_present_check
      check (
        recommendation_identity is null
        or length(btrim(recommendation_identity)) > 0
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.positions'::regclass
      and conname = 'positions_recommendation_normative_digest_format_check'
  ) then
    alter table public.positions
      add constraint positions_recommendation_normative_digest_format_check
      check (
        recommendation_normative_digest is null
        or recommendation_normative_digest ~ '^[0-9a-f]{64}$'
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.positions'::regclass
      and conname = 'positions_lineage_tuple_complete_check'
  ) then
    alter table public.positions
      add constraint positions_lineage_tuple_complete_check
      check (
        (position_version is null
          and durable_recommendation_version is null
          and recommendation_identity is null
          and recommendation_normative_digest is null)
        or (position_version is not null
          and durable_recommendation_version is not null
          and recommendation_identity is not null
          and recommendation_normative_digest is not null)
      ) not valid;
  end if;
end;
$$;
