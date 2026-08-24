-- Action 666EM — additive v2 projection-contract marker only.
--
-- This source package deliberately contains no DML, runtime routine, grant,
-- RLS adjustment, validation, generated-type refresh or writer activation.
-- It adds the marker designed by Action 666EL and keeps every new column
-- nullable until a separate exact catalog proof and a later write authority.

alter table public.recommendations
  add column if not exists recommendation_projection_contract text null;

alter table public.positions
  add column if not exists recommendation_projection_contract text null;

-- Fail closed if either marker column exists with a divergent physical shape.
do $$
declare
  marker_column record;
begin
  for marker_column in
    select *
    from (
      values
        ('public.recommendations'::regclass, 'recommendation_projection_contract', 'text'::regtype),
        ('public.positions'::regclass, 'recommendation_projection_contract', 'text'::regtype)
    ) as expected(relation_id, column_name, type_id)
  loop
    if not exists (
      select 1
      from pg_catalog.pg_attribute attribute_record
      where attribute_record.attrelid = marker_column.relation_id
        and attribute_record.attname = marker_column.column_name
        and attribute_record.atttypid = marker_column.type_id
        and not attribute_record.attnotnull
        and attribute_record.attnum > 0
        and not attribute_record.attisdropped
    ) then
      raise exception 'action_666em_projection_contract_marker_shape_mismatch: %.%',
        marker_column.relation_id::pg_catalog.regclass,
        marker_column.column_name;
    end if;
  end loop;
end;
$$;

-- Existing Action 666EE constraints remain in force. These four additional
-- NOT VALID checks make a future non-null tuple unambiguously v2 without
-- changing the legacy all-null tuple or inferring an absent marker as v1.
do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.recommendations'::regclass
      and conname = 'recommendations_recommendation_projection_contract_value_check'
  ) then
    alter table public.recommendations
      add constraint recommendations_recommendation_projection_contract_value_check
      check (
        recommendation_projection_contract is null
        or recommendation_projection_contract = 'legacy_recommendation_normative_projection_v2'
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.recommendations'::regclass
      and conname = 'recommendations_lineage_projection_contract_complete_check'
  ) then
    alter table public.recommendations
      add constraint recommendations_lineage_projection_contract_complete_check
      check (
        (recommendation_version is null
          and recommendation_identity is null
          and recommendation_normative_digest is null
          and recommendation_projection_contract is null)
        or (recommendation_version is not null
          and recommendation_identity is not null
          and recommendation_normative_digest is not null
          and recommendation_projection_contract = 'legacy_recommendation_normative_projection_v2')
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.positions'::regclass
      and conname = 'positions_recommendation_projection_contract_value_check'
  ) then
    alter table public.positions
      add constraint positions_recommendation_projection_contract_value_check
      check (
        recommendation_projection_contract is null
        or recommendation_projection_contract = 'legacy_recommendation_normative_projection_v2'
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.positions'::regclass
      and conname = 'positions_lineage_projection_contract_complete_check'
  ) then
    alter table public.positions
      add constraint positions_lineage_projection_contract_complete_check
      check (
        (position_version is null
          and durable_recommendation_version is null
          and recommendation_identity is null
          and recommendation_normative_digest is null
          and recommendation_projection_contract is null)
        or (position_version is not null
          and durable_recommendation_version is not null
          and recommendation_identity is not null
          and recommendation_normative_digest is not null
          and recommendation_projection_contract = 'legacy_recommendation_normative_projection_v2')
      ) not valid;
  end if;
end;
$$;
