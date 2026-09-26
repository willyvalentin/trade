begin;

do $$
declare
  owner_id uuid := '11111111-1111-4111-8111-111111111111';
  cycle_id text := 'scheduled_scan_attempt_receipt_001';
  active_receipt jsonb;
  terminal_receipt jsonb;
begin
  if has_table_privilege('anon', 'public.observation_cycle_receipts', 'select')
     or has_table_privilege('authenticated', 'public.observation_cycle_receipts', 'select')
     or has_table_privilege('anon', 'public.observation_cycle_receipts', 'insert')
     or has_table_privilege('authenticated', 'public.observation_cycle_receipts', 'insert')
     or not has_table_privilege('service_role', 'public.observation_cycle_receipts', 'select')
     or not has_table_privilege('service_role', 'public.observation_cycle_receipts', 'insert')
     or not has_table_privilege('service_role', 'public.observation_cycle_receipts', 'update') then
    raise exception 'observation-cycle receipt grants are incorrect';
  end if;

  if not coalesce((
    select relrowsecurity
    from pg_class
    where oid = 'public.observation_cycle_receipts'::regclass
  ), false) then
    raise exception 'observation-cycle receipt RLS must be enabled';
  end if;

  active_receipt := jsonb_build_object(
    'receipt_version', 'observation_cycle_receipt_v1',
    'cycle_fingerprint', cycle_id,
    'owner_user_id', owner_id::text,
    'source_attempt_fingerprint', cycle_id,
    'cycle_status', 'active',
    'disposition', 'pending',
    'observation_policy_version', 'scheduled_scan_observation_cycle_v1',
    'trigger', jsonb_build_object('status', 'received'),
    'admission', jsonb_build_object('status', 'admitted'),
    'provider_request', jsonb_build_object('status', 'unknown'),
    'provider_response', jsonb_build_object('status', 'unknown'),
    'freshness', jsonb_build_object('status', 'unknown'),
    'discovery_evaluation', jsonb_build_object('status', 'unknown'),
    'publication', jsonb_build_object('status', 'unknown'),
    'decision', jsonb_build_object('outcome', 'route_received'),
    'authority', jsonb_build_object(
      'can_arm_scheduler', false,
      'can_call_provider', false,
      'can_change_ranking', false,
      'can_publish', false,
      'can_execute_paper', false,
      'can_execute_broker', false
    )
  );

  insert into public.observation_cycle_receipts (
    cycle_fingerprint,
    owner_user_id,
    source_attempt_fingerprint,
    trigger_kind,
    cycle_status,
    disposition,
    observation_policy_version,
    scheduled_slot_at,
    triggered_at,
    route_received_at,
    receipt_json
  ) values (
    cycle_id,
    owner_id,
    cycle_id,
    'netlify_schedule',
    'active',
    'pending',
    'scheduled_scan_observation_cycle_v1',
    '2026-09-25T16:15:00.000Z',
    '2026-09-25T16:15:00.000Z',
    '2026-09-25T16:15:04.000Z',
    active_receipt
  );

  terminal_receipt := active_receipt || jsonb_build_object(
    'cycle_status', 'completed',
    'disposition', 'no_trade',
    'decision', jsonb_build_object('outcome', 'scanned')
  );

  insert into public.observation_cycle_receipts (
    cycle_fingerprint,
    owner_user_id,
    source_attempt_fingerprint,
    trigger_kind,
    cycle_status,
    disposition,
    observation_policy_version,
    scheduled_slot_at,
    triggered_at,
    route_received_at,
    finalized_at,
    receipt_json
  ) values (
    cycle_id,
    owner_id,
    cycle_id,
    'netlify_schedule',
    'completed',
    'no_trade',
    'scheduled_scan_observation_cycle_v1',
    '2026-09-25T16:15:00.000Z',
    '2026-09-25T16:15:00.000Z',
    '2026-09-25T16:15:04.000Z',
    '2026-09-25T16:15:10.000Z',
    terminal_receipt
  ) on conflict (owner_user_id, cycle_fingerprint) do update set
    cycle_status = excluded.cycle_status,
    disposition = excluded.disposition,
    finalized_at = excluded.finalized_at,
    receipt_json = excluded.receipt_json,
    updated_at = excluded.updated_at;

  if (select count(*) from public.observation_cycle_receipts where owner_user_id = owner_id) <> 1
     or not exists (
       select 1
       from public.observation_cycle_receipts
       where owner_user_id = owner_id
         and cycle_fingerprint = cycle_id
         and cycle_status = 'completed'
         and disposition = 'no_trade'
         and finalized_at is not null
     ) then
    raise exception 'one cycle must advance from active to one terminal receipt';
  end if;

  update public.observation_cycle_receipts
  set cycle_status = 'active',
      disposition = 'pending',
      finalized_at = null,
      receipt_json = active_receipt
  where owner_user_id = owner_id and cycle_fingerprint = cycle_id;

  if not exists (
    select 1
    from public.observation_cycle_receipts
    where owner_user_id = owner_id
      and cycle_fingerprint = cycle_id
      and cycle_status = 'completed'
      and disposition = 'no_trade'
      and finalized_at is not null
  ) then
    raise exception 'terminal receipt regressed after a delayed active update';
  end if;

  begin
    insert into public.observation_cycle_receipts (
      cycle_fingerprint,
      owner_user_id,
      source_attempt_fingerprint,
      trigger_kind,
      cycle_status,
      disposition,
      observation_policy_version,
      triggered_at,
      route_received_at,
      receipt_json
    ) values (
      'scheduled_scan_attempt_receipt_002',
      owner_id,
      'scheduled_scan_attempt_receipt_002',
      'netlify_schedule',
      'active',
      'pending',
      'scheduled_scan_observation_cycle_v1',
      '2026-09-25T16:30:00.000Z',
      '2026-09-25T16:30:04.000Z',
      jsonb_set(
        jsonb_set(
          jsonb_set(active_receipt, '{cycle_fingerprint}', '"scheduled_scan_attempt_receipt_002"'),
          '{source_attempt_fingerprint}',
          '"scheduled_scan_attempt_receipt_002"'
        ),
        '{authority,can_publish}',
        'true'
      )
    );
    raise exception 'authority escalation unexpectedly passed';
  exception
    when check_violation then null;
  end;
end;
$$;

rollback;
