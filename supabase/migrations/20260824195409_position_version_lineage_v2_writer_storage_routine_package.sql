-- Action 666ER: private v2 owner-bound position-writer storage and routine.
--
-- These are reviewed source bytes only. This action does not apply this
-- migration, bind a runtime caller, refresh generated types, or write any row.

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

do $$
begin
  if pg_catalog.to_regclass(
    'private.owner_bound_position_command_idempotency_v2'
  ) is not null then
    raise exception 'action_666er_idempotency_relation_conflict';
  end if;

  if pg_catalog.to_regprocedure(
    'private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)'
  ) is not null then
    raise exception 'action_666er_writer_routine_conflict';
  end if;

  if pg_catalog.to_regprocedure('extensions.digest(bytea,text)') is null then
    raise exception 'action_666er_pgcrypto_digest_dependency_missing';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_attribute attribute_record
    where attribute_record.attrelid = 'public.recommendations'::pg_catalog.regclass
      and attribute_record.attname = 'owner_user_id'
      and attribute_record.atttypid = 'uuid'::pg_catalog.regtype
      and attribute_record.attnum > 0
      and not attribute_record.attisdropped
  ) then
    raise exception 'action_666er_recommendation_owner_shape_missing';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_attribute attribute_record
    where attribute_record.attrelid = 'public.recommendations'::pg_catalog.regclass
      and attribute_record.attname = 'recommendation_version'
      and attribute_record.atttypid = 'int8'::pg_catalog.regtype
      and attribute_record.attnum > 0
      and not attribute_record.attisdropped
  ) then
    raise exception 'action_666er_recommendation_version_shape_missing';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_attribute attribute_record
    where attribute_record.attrelid = 'public.recommendations'::pg_catalog.regclass
      and attribute_record.attname = 'recommendation_identity'
      and attribute_record.atttypid = 'text'::pg_catalog.regtype
      and attribute_record.attnum > 0
      and not attribute_record.attisdropped
  ) then
    raise exception 'action_666er_recommendation_identity_shape_missing';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_attribute attribute_record
    where attribute_record.attrelid = 'public.recommendations'::pg_catalog.regclass
      and attribute_record.attname = 'recommendation_normative_digest'
      and attribute_record.atttypid = 'text'::pg_catalog.regtype
      and attribute_record.attnum > 0
      and not attribute_record.attisdropped
  ) then
    raise exception 'action_666er_recommendation_digest_shape_missing';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_attribute attribute_record
    where attribute_record.attrelid = 'public.recommendations'::pg_catalog.regclass
      and attribute_record.attname = 'recommendation_projection_contract'
      and attribute_record.atttypid = 'text'::pg_catalog.regtype
      and attribute_record.attnum > 0
      and not attribute_record.attisdropped
  ) then
    raise exception 'action_666er_recommendation_projection_contract_shape_missing';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_class relation_record
    join pg_catalog.pg_namespace namespace_record
      on namespace_record.oid = relation_record.relnamespace
    where namespace_record.nspname = 'public'
      and relation_record.relname = 'position_version_history'
      and relation_record.relkind = 'r'
  ) then
    raise exception 'action_666er_position_version_history_missing';
  end if;
end;
$$;

create table private.owner_bound_position_command_idempotency_v2 (
  authenticated_server_owner uuid not null,
  canonical_command_digest text not null,
  opaque_recommendation_reference uuid not null,
  recommendation_version bigint not null,
  recommendation_identity text not null,
  recommendation_normative_digest text not null,
  recommendation_projection_contract text not null,
  server_generated_position_identity uuid not null,
  initial_position_version bigint not null,
  committed_outcome text not null,
  initial_history_identity text not null,
  committed_at timestamptz not null default pg_catalog.now(),

  constraint owner_bound_position_command_idempotency_v2_pkey
    primary key (authenticated_server_owner, canonical_command_digest),
  constraint owner_bound_position_command_idempotency_v2_owner_recommendation_key
    unique (authenticated_server_owner, opaque_recommendation_reference),
  constraint owner_bound_position_command_idempotency_v2_recommendation_owner_fkey
    foreign key (opaque_recommendation_reference, authenticated_server_owner)
    references public.recommendations (id, owner_user_id)
    on delete restrict,
  constraint owner_bound_position_command_idempotency_v2_position_owner_fkey
    foreign key (server_generated_position_identity, authenticated_server_owner)
    references public.positions (id, owner_user_id)
    on delete restrict
    deferrable initially deferred,
  constraint owner_bound_position_command_idempotency_v2_digest_format_check
    check (canonical_command_digest ~ '^[0-9a-f]{64}$'),
  constraint owner_bound_position_command_idempotency_v2_recommendation_version_check
    check (recommendation_version between 1 and 9007199254740991),
  constraint owner_bound_position_command_idempotency_v2_recommendation_identity_check
    check (length(pg_catalog.btrim(recommendation_identity)) > 0),
  constraint owner_bound_position_command_idempotency_v2_recommendation_digest_check
    check (recommendation_normative_digest ~ '^[0-9a-f]{64}$'),
  constraint owner_bound_position_command_idempotency_v2_projection_contract_check
    check (
      recommendation_projection_contract =
        'legacy_recommendation_normative_projection_v2'
    ),
  constraint owner_bound_position_command_idempotency_v2_initial_position_version_check
    check (initial_position_version = 1),
  constraint owner_bound_position_command_idempotency_v2_outcome_check
    check (committed_outcome = 'created'),
  constraint owner_bound_position_command_idempotency_v2_history_identity_check
    check (
      initial_history_identity =
        server_generated_position_identity::text || ':' ||
        authenticated_server_owner::text || ':' ||
        initial_position_version::text
    )
);

alter table private.owner_bound_position_command_idempotency_v2
  enable row level security;

revoke all privileges on table private.owner_bound_position_command_idempotency_v2
  from public, anon, authenticated, service_role;

create function private.write_owner_bound_recommendation_position_v2(
  p_authenticated_server_owner uuid,
  p_opaque_recommendation_reference uuid,
  p_canonical_command_digest text
)
returns table (
  disposition text,
  position_id uuid,
  position_version bigint,
  initial_history_identity text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recommendation public.recommendations%rowtype;
  v_receipt private.owner_bound_position_command_idempotency_v2%rowtype;
  v_position_id uuid;
  v_position_state_frame jsonb;
  v_position_state_digest text;
  v_initial_history_identity text;
  v_receipt_created boolean := false;
begin
  if p_authenticated_server_owner is null
    or p_opaque_recommendation_reference is null
    or p_canonical_command_digest is null
    or p_canonical_command_digest !~ '^[0-9a-f]{64}$'
  then
    raise exception 'action_666er_invalid_owner_bound_command'
      using errcode = '22023';
  end if;

  select *
  into v_recommendation
  from public.recommendations
  where id = p_opaque_recommendation_reference
    and owner_user_id = p_authenticated_server_owner
  for update;

  if not found then
    raise exception 'action_666er_owned_recommendation_not_found'
      using errcode = 'P0002';
  end if;

  if v_recommendation.recommendation_version is null
    or v_recommendation.recommendation_identity is null
    or v_recommendation.recommendation_normative_digest is null
    or v_recommendation.recommendation_projection_contract is distinct from
      'legacy_recommendation_normative_projection_v2'
  then
    raise exception 'action_666er_recommendation_lineage_not_v2_complete'
      using errcode = '55000';
  end if;

  select *
  into v_receipt
  from private.owner_bound_position_command_idempotency_v2
  where authenticated_server_owner = p_authenticated_server_owner
    and canonical_command_digest = p_canonical_command_digest
  for update;

  if found then
    v_receipt_created := false;
  else
    v_position_id := pg_catalog.gen_random_uuid();
    v_initial_history_identity :=
      v_position_id::text || ':' ||
      p_authenticated_server_owner::text || ':1';

    insert into private.owner_bound_position_command_idempotency_v2 (
      authenticated_server_owner,
      canonical_command_digest,
      opaque_recommendation_reference,
      recommendation_version,
      recommendation_identity,
      recommendation_normative_digest,
      recommendation_projection_contract,
      server_generated_position_identity,
      initial_position_version,
      committed_outcome,
      initial_history_identity
    ) values (
      p_authenticated_server_owner,
      p_canonical_command_digest,
      p_opaque_recommendation_reference,
      v_recommendation.recommendation_version,
      v_recommendation.recommendation_identity,
      v_recommendation.recommendation_normative_digest,
      v_recommendation.recommendation_projection_contract,
      v_position_id,
      1,
      'created',
      v_initial_history_identity
    )
    on conflict (authenticated_server_owner, canonical_command_digest)
      do nothing
    returning * into v_receipt;

    if found then
      v_receipt_created := true;
    else
      select *
      into v_receipt
      from private.owner_bound_position_command_idempotency_v2
      where authenticated_server_owner = p_authenticated_server_owner
        and canonical_command_digest = p_canonical_command_digest
      for update;

      if not found then
        raise exception 'action_666er_receipt_reservation_unavailable'
          using errcode = '40001';
      end if;
    end if;
  end if;

  if not v_receipt_created then
    if v_receipt.opaque_recommendation_reference = p_opaque_recommendation_reference
      and v_receipt.recommendation_version = v_recommendation.recommendation_version
      and v_receipt.recommendation_identity = v_recommendation.recommendation_identity
      and v_receipt.recommendation_normative_digest =
        v_recommendation.recommendation_normative_digest
      and v_receipt.recommendation_projection_contract =
        v_recommendation.recommendation_projection_contract
      and v_receipt.initial_position_version = 1
      and v_receipt.committed_outcome = 'created'
      and v_receipt.initial_history_identity =
        v_receipt.server_generated_position_identity::text || ':' ||
        p_authenticated_server_owner::text || ':1'
      and exists (
        select 1
        from public.positions
        where id = v_receipt.server_generated_position_identity
          and owner_user_id = p_authenticated_server_owner
          and recommendation_id = p_opaque_recommendation_reference
          and position_version = 1
          and durable_recommendation_version = v_recommendation.recommendation_version
          and recommendation_identity = v_recommendation.recommendation_identity
          and recommendation_normative_digest =
            v_recommendation.recommendation_normative_digest
          and recommendation_projection_contract =
            v_recommendation.recommendation_projection_contract
      )
      and exists (
        select 1
        from public.position_version_history
        where position_id = v_receipt.server_generated_position_identity
          and owner_user_id = p_authenticated_server_owner
          and position_version = 1
          and recommendation_id = p_opaque_recommendation_reference
          and durable_recommendation_version = v_recommendation.recommendation_version
          and recommendation_identity = v_recommendation.recommendation_identity
          and recommendation_normative_digest =
            v_recommendation.recommendation_normative_digest
      )
    then
      disposition := 'replayed';
      position_id := v_receipt.server_generated_position_identity;
      position_version := v_receipt.initial_position_version;
      initial_history_identity := v_receipt.initial_history_identity;
      return next;
      return;
    end if;

    raise exception 'action_666er_receipt_binding_conflict'
      using errcode = '23505';
  end if;

  if v_recommendation.status not in ('new', 'watched')
    or v_recommendation.ticker !~ '^[A-Z][A-Z0-9./-]{0,14}$'
    or v_recommendation.entry_low is null
    or v_recommendation.entry_low <= 0
  then
    raise exception 'action_666er_recommendation_not_eligible_for_position'
      using errcode = '55000';
  end if;

  if exists (
    select 1
    from public.positions
    where recommendation_id = p_opaque_recommendation_reference
      and owner_user_id = p_authenticated_server_owner
  ) then
    raise exception 'action_666er_existing_position_without_matching_receipt'
      using errcode = '23505';
  end if;

  insert into public.positions (
    id,
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
    execution_metadata,
    position_version,
    durable_recommendation_version,
    recommendation_identity,
    recommendation_normative_digest,
    recommendation_projection_contract
  ) values (
    v_position_id,
    p_authenticated_server_owner,
    p_opaque_recommendation_reference,
    v_recommendation.ticker,
    v_recommendation.company_name,
    v_recommendation.entry_low,
    null,
    v_recommendation.stop_loss,
    v_recommendation.target_1,
    v_recommendation.target_2,
    'open',
    pg_catalog.jsonb_build_object(
      'writer_contract', 'owner_bound_recommendation_position_v2',
      'canonical_command_digest', p_canonical_command_digest
    ),
    1,
    v_recommendation.recommendation_version,
    v_recommendation.recommendation_identity,
    v_recommendation.recommendation_normative_digest,
    v_recommendation.recommendation_projection_contract
  );

  update public.recommendations
  set status = 'taken'
  where id = p_opaque_recommendation_reference
    and owner_user_id = p_authenticated_server_owner;

  if not found then
    raise exception 'action_666er_recommendation_state_transition_missing'
      using errcode = '40001';
  end if;

  v_position_state_frame := pg_catalog.jsonb_build_object(
    'position_id', v_position_id,
    'owner_user_id', p_authenticated_server_owner,
    'recommendation_id', p_opaque_recommendation_reference,
    'position_version', 1,
    'durable_recommendation_version', v_recommendation.recommendation_version,
    'recommendation_identity', v_recommendation.recommendation_identity,
    'recommendation_normative_digest', v_recommendation.recommendation_normative_digest,
    'recommendation_projection_contract', v_recommendation.recommendation_projection_contract,
    'ticker', v_recommendation.ticker,
    'company_name', v_recommendation.company_name,
    'entry_price', v_recommendation.entry_low,
    'position_size', null,
    'current_stop', v_recommendation.stop_loss,
    'target_1', v_recommendation.target_1,
    'target_2', v_recommendation.target_2,
    'status', 'open'
  );
  v_position_state_digest := pg_catalog.encode(
    extensions.digest(
      pg_catalog.convert_to(v_position_state_frame::text, 'UTF8'),
      'sha256'
    ),
    'hex'
  );

  insert into public.position_version_history (
    position_id,
    owner_user_id,
    position_version,
    recommendation_id,
    durable_recommendation_version,
    recommendation_identity,
    recommendation_normative_digest,
    position_state_frame,
    position_state_digest
  ) values (
    v_position_id,
    p_authenticated_server_owner,
    1,
    p_opaque_recommendation_reference,
    v_recommendation.recommendation_version,
    v_recommendation.recommendation_identity,
    v_recommendation.recommendation_normative_digest,
    v_position_state_frame,
    v_position_state_digest
  );

  disposition := 'created';
  position_id := v_position_id;
  position_version := 1;
  initial_history_identity := v_initial_history_identity;
  return next;
end;
$$;

revoke all on function private.write_owner_bound_recommendation_position_v2(
  uuid, uuid, text
) from public, anon, authenticated;
grant execute on function private.write_owner_bound_recommendation_position_v2(
  uuid, uuid, text
) to service_role;

comment on function private.write_owner_bound_recommendation_position_v2(
  uuid, uuid, text
) is 'Action 666ER private service-role-only v2 writer. It locks the owner-scoped recommendation, derives complete v2 lineage, reserves an immutable receipt, creates a version-one position and appends matching history in one transaction.';
