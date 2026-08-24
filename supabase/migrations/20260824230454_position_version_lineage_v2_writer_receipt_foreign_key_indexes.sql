-- Action 666ET: private v2 receipt foreign-key relationship indexes.
--
-- These are reviewed source bytes only. This action does not apply the
-- migration, invoke the writer, refresh generated types, or write any row.

do $$
begin
  if pg_catalog.to_regclass(
    'private.owner_bound_position_command_idempotency_v2'
  ) is null then
    raise exception 'action_666et_receipt_relation_missing';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_record
    where constraint_record.conname =
        'owner_bound_position_command_idempotency_v2_recommendation_owner_fkey'
      and constraint_record.conrelid =
        'private.owner_bound_position_command_idempotency_v2'::pg_catalog.regclass
      and constraint_record.contype = 'f'
      and constraint_record.confrelid = 'public.recommendations'::pg_catalog.regclass
  ) then
    raise exception 'action_666et_recommendation_owner_foreign_key_missing';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_record
    where constraint_record.conname =
        'owner_bound_position_command_idempotency_v2_position_owner_fkey'
      and constraint_record.conrelid =
        'private.owner_bound_position_command_idempotency_v2'::pg_catalog.regclass
      and constraint_record.contype = 'f'
      and constraint_record.confrelid = 'public.positions'::pg_catalog.regclass
  ) then
    raise exception 'action_666et_position_owner_foreign_key_missing';
  end if;

  if pg_catalog.to_regclass(
    'private.obpciv2_receipt_recommendation_owner_idx'
  ) is not null then
    raise exception 'action_666et_recommendation_owner_index_conflict';
  end if;

  if pg_catalog.to_regclass(
    'private.obpciv2_receipt_position_owner_idx'
  ) is not null then
    raise exception 'action_666et_position_owner_index_conflict';
  end if;
end;
$$;

create index obpciv2_receipt_recommendation_owner_idx
  on private.owner_bound_position_command_idempotency_v2 (
    opaque_recommendation_reference,
    authenticated_server_owner
  );

create index obpciv2_receipt_position_owner_idx
  on private.owner_bound_position_command_idempotency_v2 (
    server_generated_position_identity,
    authenticated_server_owner
  );
