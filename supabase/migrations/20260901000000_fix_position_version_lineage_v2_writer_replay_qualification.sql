-- Action 666IU: qualify replay predicates in the already-created V2 writer.
--
-- The original V2 source migration is immutable. This forward-only repair
-- preserves its transaction and grant contract while avoiding PL/pgSQL output
-- parameter collisions with position/history columns during exact replay.

do $$
begin
  if pg_catalog.to_regprocedure(
    'private.write_owner_bound_recommendation_position_v2(uuid,uuid,text)'
  ) is null then
    raise exception 'action_666iu_writer_routine_missing';
  end if;
end;
$$;

create or replace function private.write_owner_bound_recommendation_position_v2(
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
        from public.positions as position_record
        where position_record.id = v_receipt.server_generated_position_identity
          and position_record.owner_user_id = p_authenticated_server_owner
          and position_record.recommendation_id = p_opaque_recommendation_reference
          and position_record.position_version = 1
          and position_record.durable_recommendation_version =
            v_recommendation.recommendation_version
          and position_record.recommendation_identity =
            v_recommendation.recommendation_identity
          and position_record.recommendation_normative_digest =
            v_recommendation.recommendation_normative_digest
          and position_record.recommendation_projection_contract =
            v_recommendation.recommendation_projection_contract
      )
      and exists (
        select 1
        from public.position_version_history as history_record
        where history_record.position_id =
            v_receipt.server_generated_position_identity
          and history_record.owner_user_id = p_authenticated_server_owner
          and history_record.position_version = 1
          and history_record.recommendation_id = p_opaque_recommendation_reference
          and history_record.durable_recommendation_version =
            v_recommendation.recommendation_version
          and history_record.recommendation_identity =
            v_recommendation.recommendation_identity
          and history_record.recommendation_normative_digest =
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
) is 'Action 666IU forward repair of Action 666ER private service-role-only V2 writer. Replay predicates use relation-qualified position/history columns so output parameter names cannot cause PL/pgSQL ambiguity.';
