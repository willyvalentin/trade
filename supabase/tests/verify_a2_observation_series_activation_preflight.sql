begin;

do $$
declare
  owner_id uuid := '6ba67b0c-fcc6-4d56-8ea4-852f85562e65';
  other_owner_id uuid := '11111111-1111-4111-8111-111111111111';
  starts_at timestamptz := '2026-09-28T13:30:00.000Z';
  expires_at timestamptz := '2026-09-28T14:30:00.000Z';
  snapshot record;
begin
  if has_function_privilege(
    'anon',
    'public.read_basic_free_observation_series_preflight_v1(uuid,date,timestamptz,timestamptz,smallint,smallint)',
    'execute'
  ) or has_function_privilege(
    'authenticated',
    'public.read_basic_free_observation_series_preflight_v1(uuid,date,timestamptz,timestamptz,smallint,smallint)',
    'execute'
  ) or not has_function_privilege(
    'service_role',
    'public.read_basic_free_observation_series_preflight_v1(uuid,date,timestamptz,timestamptz,smallint,smallint)',
    'execute'
  ) then
    raise exception 'observation-series preflight execution grants are incorrect';
  end if;

  select * into snapshot
  from public.read_basic_free_observation_series_preflight_v1(
    owner_id,
    date '2026-09-28',
    starts_at,
    expires_at,
    4::smallint,
    24::smallint
  );
  if snapshot.preflight_version <> 'observation_series_activation_preflight_v1'
     or snapshot.available_slot_count <> 4
     or snapshot.total_reservation_count <> 0
     or snapshot.daily_scheduled_attempt_count <> 0
     or snapshot.window_scheduled_attempt_count <> 0 then
    raise exception 'empty observation-series aggregate is incorrect';
  end if;

  insert into public.basic_free_discovery_credit_reservations (
    claim_id,
    execution_fingerprint,
    owner_user_id,
    trading_date,
    minute_bucket,
    catalog_observation,
    requested_credits,
    declared_daily_credit_budget,
    declared_per_minute_credit_budget,
    status,
    provider_attempted,
    finalized_at
  ) values
    (
      'series-prior-normal',
      'series-prior-normal-fingerprint',
      owner_id,
      date '2026-09-28',
      '2026-09-28T13:15:00.000Z',
      false,
      8,
      800,
      8,
      'completed',
      true,
      '2026-09-28T13:16:00.000Z'
    ),
    (
      'series-window-normal',
      'series-window-normal-fingerprint',
      owner_id,
      date '2026-09-28',
      '2026-09-28T13:30:00.000Z',
      false,
      8,
      800,
      8,
      'failed',
      true,
      '2026-09-28T13:31:00.000Z'
    ),
    (
      'series-other-owner',
      'series-other-owner-fingerprint',
      other_owner_id,
      date '2026-09-28',
      '2026-09-28T13:30:00.000Z',
      false,
      8,
      800,
      8,
      'completed',
      true,
      '2026-09-28T13:31:00.000Z'
    );

  insert into public.scheduled_scan_attempts (
    attempt_fingerprint,
    trading_date,
    source,
    mode,
    outcome,
    payload_json
  ) values
    (
      'series-window-attempt-1',
      date '2026-09-28',
      'netlify_scheduled_function',
      'scheduled',
      'blocked',
      jsonb_build_object(
        'scheduled_slot_started_at_utc',
        '2026-09-28T13:45:00.000Z'
      )
    ),
    (
      'series-window-attempt-2',
      date '2026-09-28',
      'netlify_scheduled_function',
      'scheduled',
      'blocked',
      jsonb_build_object(
        'scheduled_slot_started_at_utc',
        '2026-09-28T13:45:00.000Z'
      )
    ),
    (
      'series-unresolved-attempt',
      date '2026-09-28',
      'netlify_scheduled_function',
      'scheduled',
      'route_received',
      jsonb_build_object(
        'scheduled_slot_started_at_utc',
        '2026-09-28T15:00:00.000Z'
      )
    ),
    (
      'series-unattributed-attempt',
      date '2026-09-28',
      'netlify_scheduled_function',
      'scheduled',
      'blocked',
      '{}'::jsonb
    );

  select * into snapshot
  from public.read_basic_free_observation_series_preflight_v1(
    owner_id,
    date '2026-09-28',
    starts_at,
    expires_at,
    4::smallint,
    24::smallint
  );
  if snapshot.total_reservation_count <> 2
     or snapshot.total_reserved_credits <> 16
     or snapshot.window_reservation_count <> 1
     or snapshot.window_reserved_credits <> 8
     or snapshot.daily_scheduled_attempt_count <> 4
     or snapshot.window_scheduled_attempt_count <> 2
     or snapshot.window_distinct_attempt_slot_count <> 1
     or snapshot.window_duplicate_attempt_slot_count <> 1
     or snapshot.unresolved_scheduled_attempt_count <> 1
     or snapshot.unattributed_scheduled_attempt_count <> 1 then
    raise exception 'observation-series overlap aggregates are incorrect';
  end if;

  if exists (
    select 1
    from public.read_basic_free_observation_series_preflight_v1(
      owner_id,
      date '2026-09-28',
      '2026-09-28T13:31:00.000Z',
      expires_at,
      4::smallint,
      24::smallint
    )
  ) then
    raise exception 'off-quarter series start must return no aggregate';
  end if;

  if exists (
    select 1
    from public.read_basic_free_observation_series_preflight_v1(
      owner_id,
      date '2026-09-28',
      starts_at,
      expires_at,
      5::smallint,
      24::smallint
    )
  ) then
    raise exception 'attempt cap above available slots must return no aggregate';
  end if;

  if exists (
    select 1
    from public.read_basic_free_observation_series_preflight_v1(
      owner_id,
      date '2026-09-27',
      starts_at,
      expires_at,
      4::smallint,
      24::smallint
    )
  ) then
    raise exception 'New York date mismatch must return no aggregate';
  end if;
end;
$$;

rollback;
