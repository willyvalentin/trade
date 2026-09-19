-- IF-4: an evaluation charter is immutable owner-bound evidence that must
-- exist before a learning baseline can be frozen. It stores no market payload,
-- does not select a candidate, and cannot invoke a provider or broker.
begin;

create table public.recommendation_evaluation_charters (
  id uuid primary key default gen_random_uuid(),
  contract_version text not null default 'recommendation_evaluation_charter_v1',
  charter_fingerprint text not null unique,
  owner_user_id uuid not null,
  segment_key text not null,
  policy_attribution jsonb not null,
  charter_json jsonb not null,
  created_at timestamptz not null default now(),
  constraint recommendation_evaluation_charters_contract_check
    check (contract_version = 'recommendation_evaluation_charter_v1'),
  constraint recommendation_evaluation_charters_fingerprint_check
    check (charter_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint recommendation_evaluation_charters_segment_check
    check (length(segment_key) between 1 and 16384),
  constraint recommendation_evaluation_charters_policy_check
    check (
      jsonb_typeof(policy_attribution) = 'object'
      and pg_column_size(policy_attribution) <= 65536
    ),
  constraint recommendation_evaluation_charters_payload_check
    check (
      jsonb_typeof(charter_json) = 'object'
      and pg_column_size(charter_json) <= 65536
    ),
  constraint recommendation_evaluation_charters_owner_segment_key
    unique (owner_user_id, segment_key)
);

create index recommendation_evaluation_charters_owner_created_idx
  on public.recommendation_evaluation_charters (owner_user_id, created_at desc);

alter table public.recommendation_evaluation_charters enable row level security;
revoke all on table public.recommendation_evaluation_charters
  from public, anon, authenticated, service_role;

-- Older immutable baseline rows remain readable but are ineligible for any
-- charter-bound comparison because their charter fingerprint is null.
alter table public.recommendation_learning_baseline_freezes
  add column evaluation_charter_fingerprint text;

alter table public.recommendation_learning_baseline_freezes
  add constraint recommendation_learning_baseline_freezes_charter_fingerprint_check
  check (
    evaluation_charter_fingerprint is null
    or evaluation_charter_fingerprint ~ '^[a-f0-9]{64}$'
  );

create or replace function public.record_recommendation_evaluation_charter(
  p_charter_fingerprint text,
  p_owner_user_id uuid,
  p_segment_key text,
  p_policy_attribution jsonb,
  p_charter_json jsonb,
  p_expected_contract_version text
)
returns table (
  write_status text,
  charter_id uuid,
  charter_fingerprint text,
  owner_user_id uuid,
  segment_key text,
  policy_attribution jsonb,
  charter_json jsonb,
  created_at timestamptz,
  idempotent boolean,
  blocker text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  existing public.recommendation_evaluation_charters%rowtype;
begin
  if p_expected_contract_version <> 'recommendation_evaluation_charter_v1'
     or p_charter_fingerprint is null
     or p_charter_fingerprint !~ '^[a-f0-9]{64}$'
     or p_owner_user_id is null
     or p_segment_key is null
     or length(p_segment_key) not between 1 and 16384
     or p_policy_attribution is null
     or jsonb_typeof(p_policy_attribution) <> 'object'
     or pg_column_size(p_policy_attribution) > 65536
     or p_charter_json is null
     or jsonb_typeof(p_charter_json) <> 'object'
     or pg_column_size(p_charter_json) > 65536
     or p_charter_json->>'contract_version' <> 'recommendation_evaluation_charter_v1'
     or jsonb_typeof(p_charter_json->'thresholds') <> 'object'
     or jsonb_typeof(p_charter_json->'concentration_limits') <> 'object'
     or jsonb_typeof(p_charter_json->'evaluation_window') <> 'object'
     or jsonb_typeof(p_charter_json->'feasibility_inputs') <> 'object'
     or jsonb_typeof(p_charter_json->'setup_slices') <> 'array'
     or jsonb_typeof(p_charter_json->'regime_slices') <> 'array'
     or length(coalesce(p_charter_json->>'hypothesis', '')) not between 20 and 2800
     or length(coalesce(p_charter_json->>'eligible_universe', '')) not between 1 and 2800
     or coalesce(jsonb_array_length(p_charter_json->'setup_slices'), 0) not between 1 and 50
     or coalesce(jsonb_array_length(p_charter_json->'regime_slices'), 0) not between 1 and 50
     or p_charter_json#>>'{outcome_rules,primary_horizon}' not in ('15m', '30m', '60m')
     or p_charter_json#>>'{outcome_rules,diagnostic_horizons}' is null
     or jsonb_typeof(p_charter_json#>'{outcome_rules,diagnostic_horizons}') <> 'array'
     or p_charter_json#>>'{evaluation_window,minimum_complete_decisions}' !~ '^[1-9][0-9]{0,4}$'
     or p_charter_json#>>'{evaluation_window,held_out_decision_count}' !~ '^[1-9][0-9]{0,4}$'
     or p_charter_json#>>'{evaluation_window,walk_forward_decision_count}' !~ '^[1-9][0-9]{0,4}$' then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::text, null::jsonb, null::jsonb, null::timestamptz,
      false, 'evaluation_charter_contract_invalid'::text;
    return;
  end if;

  perform pg_advisory_xact_lock(
    hashtext('recommendation_evaluation_charter:owner:' || p_owner_user_id::text || ':segment:' || p_segment_key)
  );

  select * into existing
  from public.recommendation_evaluation_charters as charter
  where charter.owner_user_id = p_owner_user_id
    and charter.segment_key = p_segment_key
  for update;

  if found then
    if existing.contract_version = p_expected_contract_version
       and existing.charter_fingerprint = p_charter_fingerprint
       and existing.policy_attribution = p_policy_attribution
       and existing.charter_json = p_charter_json then
      return query select 'evaluation_charter_already_recorded'::text,
        existing.id, existing.charter_fingerprint, existing.owner_user_id,
        existing.segment_key, existing.policy_attribution, existing.charter_json,
        existing.created_at, true, null::text;
    else
      return query select 'different_evaluation_charter_already_recorded'::text,
        null::uuid, null::text, null::uuid, null::text, null::jsonb,
        null::jsonb, null::timestamptz, false,
        'different_evaluation_charter_already_recorded'::text;
    end if;
    return;
  end if;

  insert into public.recommendation_evaluation_charters (
    charter_fingerprint,
    owner_user_id,
    segment_key,
    policy_attribution,
    charter_json
  ) values (
    p_charter_fingerprint,
    p_owner_user_id,
    p_segment_key,
    p_policy_attribution,
    p_charter_json
  ) returning * into existing;

  return query select 'evaluation_charter_recorded'::text,
    existing.id, existing.charter_fingerprint, existing.owner_user_id,
    existing.segment_key, existing.policy_attribution, existing.charter_json,
    existing.created_at, false, null::text;
end;
$$;

create or replace function public.read_recommendation_evaluation_charters(
  p_owner_user_id uuid,
  p_expected_contract_version text
)
returns table (
  readback_status text,
  charter_id uuid,
  charter_fingerprint text,
  owner_user_id uuid,
  segment_key text,
  policy_attribution jsonb,
  charter_json jsonb,
  created_at timestamptz,
  blocker text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_expected_contract_version <> 'recommendation_evaluation_charter_v1'
     or p_owner_user_id is null then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::text, null::jsonb, null::jsonb, null::timestamptz,
      'evaluation_charter_read_contract_invalid'::text;
    return;
  end if;

  return query
  select 'available'::text, charter.id, charter.charter_fingerprint,
    charter.owner_user_id, charter.segment_key, charter.policy_attribution,
    charter.charter_json, charter.created_at, null::text
  from public.recommendation_evaluation_charters as charter
  where charter.owner_user_id = p_owner_user_id
    and charter.contract_version = p_expected_contract_version
  order by charter.created_at desc, charter.id desc
  limit 50;
end;
$$;

create or replace function public.freeze_recommendation_learning_baseline_with_charter(
  p_baseline_fingerprint text,
  p_owner_user_id uuid,
  p_segment_key text,
  p_decision_record_fingerprints text[],
  p_evaluation_plan jsonb,
  p_evaluation_charter_fingerprint text,
  p_expected_contract_version text
)
returns table (
  freeze_status text,
  baseline_id uuid,
  baseline_fingerprint text,
  owner_user_id uuid,
  segment_key text,
  decision_record_fingerprints text[],
  evaluation_plan jsonb,
  evaluation_charter_fingerprint text,
  frozen_at timestamptz,
  idempotent boolean,
  blocker text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  existing public.recommendation_learning_baseline_freezes%rowtype;
  charter public.recommendation_evaluation_charters%rowtype;
  expected_plan_fingerprints text[];
  supplied_fingerprint_count integer;
  distinct_fingerprint_count integer;
begin
  if p_expected_contract_version <> 'recommendation_learning_baseline_freeze_v1'
     or p_baseline_fingerprint is null
     or p_baseline_fingerprint !~ '^[a-f0-9]{64}$'
     or p_evaluation_charter_fingerprint is null
     or p_evaluation_charter_fingerprint !~ '^[a-f0-9]{64}$'
     or p_owner_user_id is null
     or p_segment_key is null
     or length(p_segment_key) not between 1 and 16384
     or p_decision_record_fingerprints is null
     or cardinality(p_decision_record_fingerprints) not between 1 and 10000
     or p_evaluation_plan is null
     or jsonb_typeof(p_evaluation_plan) <> 'object'
     or pg_column_size(p_evaluation_plan) > 4194304
     or p_evaluation_plan->>'contract_version' <> 'recommendation_learning_evaluation_plan_v1'
     or p_evaluation_plan->>'status' <> 'ready_for_explicit_freeze'
     or p_evaluation_plan->>'segment_key' <> p_segment_key
     or jsonb_typeof(p_evaluation_plan->'policy_attribution') <> 'object'
     or jsonb_typeof(p_evaluation_plan->'decision_records') <> 'object'
     or jsonb_typeof(p_evaluation_plan#>'{decision_records,scan_run_fingerprints}') <> 'array'
     or jsonb_typeof(p_evaluation_plan->'metrics') <> 'object' then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::text, null::text[], null::jsonb, null::text,
      null::timestamptz, false, 'baseline_freeze_contract_invalid'::text;
    return;
  end if;

  select * into charter
  from public.recommendation_evaluation_charters as evaluation_charter
  where evaluation_charter.owner_user_id = p_owner_user_id
    and evaluation_charter.segment_key = p_segment_key
    and evaluation_charter.charter_fingerprint = p_evaluation_charter_fingerprint
    and evaluation_charter.contract_version = 'recommendation_evaluation_charter_v1';

  if not found or charter.policy_attribution is distinct from p_evaluation_plan->'policy_attribution' then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::text, null::text[], null::jsonb, null::text,
      null::timestamptz, false,
      'baseline_freeze_evaluation_charter_missing_or_mismatched'::text;
    return;
  end if;

  select count(*), count(distinct fingerprint)
    into supplied_fingerprint_count, distinct_fingerprint_count
  from unnest(p_decision_record_fingerprints) as supplied(fingerprint);

  if supplied_fingerprint_count <> cardinality(p_decision_record_fingerprints)
     or supplied_fingerprint_count <> distinct_fingerprint_count
     or exists (
       select 1
       from unnest(p_decision_record_fingerprints) as supplied(fingerprint)
       where fingerprint is null or length(btrim(fingerprint)) not between 1 and 240
     ) then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::text, null::text[], null::jsonb, null::text,
      null::timestamptz, false, 'baseline_freeze_decision_identities_invalid'::text;
    return;
  end if;

  select array_agg(item.value order by item.ordinality)
    into expected_plan_fingerprints
  from jsonb_array_elements_text(
    p_evaluation_plan#>'{decision_records,scan_run_fingerprints}'
  ) with ordinality as item(value, ordinality);

  if expected_plan_fingerprints is distinct from p_decision_record_fingerprints
     or coalesce(p_evaluation_plan#>>'{decision_records,count}', '') !~ '^[0-9]+$'
     or (case
       when coalesce(p_evaluation_plan#>>'{decision_records,count}', '') ~ '^[0-9]{1,5}$'
         then (p_evaluation_plan#>>'{decision_records,count}')::integer
       else -1
     end) <> cardinality(p_decision_record_fingerprints) then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::text, null::text[], null::jsonb, null::text,
      null::timestamptz, false, 'baseline_freeze_plan_identity_mismatch'::text;
    return;
  end if;

  if exists (
    select 1
    from unnest(p_decision_record_fingerprints) as supplied(fingerprint)
    left join public.recommendation_scan_runs as scan_run
      on scan_run.run_fingerprint = supplied.fingerprint
      and scan_run.owner_user_id = p_owner_user_id
    where scan_run.run_fingerprint is null
  ) then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::text, null::text[], null::jsonb, null::text,
      null::timestamptz, false, 'baseline_freeze_decision_records_not_owned_or_missing'::text;
    return;
  end if;

  perform pg_advisory_xact_lock(
    hashtext('recommendation_learning_baseline_freeze:owner:' || p_owner_user_id::text)
  );

  select * into existing
  from public.recommendation_learning_baseline_freezes as baseline_freeze
  where baseline_freeze.owner_user_id = p_owner_user_id
  for update;

  if found then
    if existing.contract_version = p_expected_contract_version
       and existing.baseline_fingerprint = p_baseline_fingerprint
       and existing.segment_key = p_segment_key
       and existing.decision_record_fingerprints = p_decision_record_fingerprints
       and existing.evaluation_plan = p_evaluation_plan
       and existing.evaluation_charter_fingerprint = p_evaluation_charter_fingerprint then
      return query select 'baseline_already_frozen'::text, existing.id,
        existing.baseline_fingerprint, existing.owner_user_id, existing.segment_key,
        existing.decision_record_fingerprints, existing.evaluation_plan,
        existing.evaluation_charter_fingerprint, existing.frozen_at, true,
        null::text;
    else
      return query select 'different_baseline_already_frozen'::text, null::uuid,
        null::text, null::uuid, null::text, null::text[], null::jsonb,
        null::text, null::timestamptz, false,
        'different_baseline_already_frozen'::text;
    end if;
    return;
  end if;

  insert into public.recommendation_learning_baseline_freezes (
    baseline_fingerprint,
    owner_user_id,
    segment_key,
    decision_record_fingerprints,
    evaluation_plan,
    evaluation_charter_fingerprint
  ) values (
    p_baseline_fingerprint,
    p_owner_user_id,
    p_segment_key,
    p_decision_record_fingerprints,
    p_evaluation_plan,
    p_evaluation_charter_fingerprint
  ) returning * into existing;

  return query select 'baseline_frozen'::text, existing.id,
    existing.baseline_fingerprint, existing.owner_user_id, existing.segment_key,
    existing.decision_record_fingerprints, existing.evaluation_plan,
    existing.evaluation_charter_fingerprint, existing.frozen_at, false,
    null::text;
end;
$$;

create or replace function public.read_recommendation_learning_baseline_with_charter(
  p_owner_user_id uuid,
  p_expected_contract_version text
)
returns table (
  readback_status text,
  baseline_id uuid,
  baseline_fingerprint text,
  owner_user_id uuid,
  segment_key text,
  decision_record_fingerprints text[],
  evaluation_plan jsonb,
  evaluation_charter_fingerprint text,
  frozen_at timestamptz,
  blocker text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  existing public.recommendation_learning_baseline_freezes%rowtype;
begin
  if p_expected_contract_version <> 'recommendation_learning_baseline_freeze_v1'
     or p_owner_user_id is null then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::text, null::text[], null::jsonb, null::text,
      null::timestamptz, 'baseline_freeze_read_contract_invalid'::text;
    return;
  end if;

  select * into existing
  from public.recommendation_learning_baseline_freezes as baseline_freeze
  where baseline_freeze.owner_user_id = p_owner_user_id
    and baseline_freeze.contract_version = p_expected_contract_version;

  if not found then
    return query select 'not_found'::text, null::uuid, null::text,
      null::uuid, null::text, null::text[], null::jsonb, null::text,
      null::timestamptz,
      'recommendation_learning_baseline_freeze_not_found'::text;
    return;
  end if;

  return query select 'available'::text, existing.id,
    existing.baseline_fingerprint, existing.owner_user_id, existing.segment_key,
    existing.decision_record_fingerprints, existing.evaluation_plan,
    existing.evaluation_charter_fingerprint, existing.frozen_at, null::text;
end;
$$;

revoke all on function public.record_recommendation_evaluation_charter(
  text, uuid, text, jsonb, jsonb, text
) from public, anon, authenticated;
revoke all on function public.read_recommendation_evaluation_charters(
  uuid, text
) from public, anon, authenticated;
revoke all on function public.freeze_recommendation_learning_baseline_with_charter(
  text, uuid, text, text[], jsonb, text, text
) from public, anon, authenticated;
revoke all on function public.read_recommendation_learning_baseline_with_charter(
  uuid, text
) from public, anon, authenticated;
grant execute on function public.record_recommendation_evaluation_charter(
  text, uuid, text, jsonb, jsonb, text
) to service_role;
grant execute on function public.read_recommendation_evaluation_charters(
  uuid, text
) to service_role;
grant execute on function public.freeze_recommendation_learning_baseline_with_charter(
  text, uuid, text, text[], jsonb, text, text
) to service_role;
grant execute on function public.read_recommendation_learning_baseline_with_charter(
  uuid, text
) to service_role;

comment on table public.recommendation_evaluation_charters is
  'Server-only immutable IF-4 charters. They bind a hypothesis, thresholds, sample and concentration limits to one owner and policy/version segment before a learning baseline can be frozen. They cannot fetch data, modify ranking, publish candidates or execute trades.';

commit;
