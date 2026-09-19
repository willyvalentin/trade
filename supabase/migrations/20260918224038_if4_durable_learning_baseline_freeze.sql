-- IF-4: preserve one explicit, owner-bound evaluation baseline before any
-- policy change can be compared to it. This is evidence storage only: it does
-- not fetch market data, derive outcomes, tune ranking, publish candidates or
-- reach execution.
begin;

create table if not exists public.recommendation_learning_baseline_freezes (
  id uuid primary key default gen_random_uuid(),
  contract_version text not null default 'recommendation_learning_baseline_freeze_v1',
  baseline_fingerprint text not null unique,
  owner_user_id uuid not null unique,
  segment_key text not null,
  decision_record_fingerprints text[] not null,
  evaluation_plan jsonb not null,
  frozen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint recommendation_learning_baseline_freezes_contract_check
    check (contract_version = 'recommendation_learning_baseline_freeze_v1'),
  constraint recommendation_learning_baseline_freezes_fingerprint_check
    check (baseline_fingerprint ~ '^[a-f0-9]{64}$'),
  constraint recommendation_learning_baseline_freezes_segment_check
    check (length(segment_key) between 1 and 16384),
  constraint recommendation_learning_baseline_freezes_decision_records_check
    check (
      cardinality(decision_record_fingerprints) between 1 and 10000
      and array_position(decision_record_fingerprints, null) is null
    ),
  constraint recommendation_learning_baseline_freezes_plan_check
    check (
      jsonb_typeof(evaluation_plan) = 'object'
      -- The contract permits 10,000 bounded decision identities. Four MiB is
      -- sufficient for that complete immutable receipt while still preventing
      -- an unbounded JSON document from entering this audit-only table.
      and pg_column_size(evaluation_plan) <= 4194304
    )
);

create index if not exists recommendation_learning_baseline_freezes_owner_frozen_idx
  on public.recommendation_learning_baseline_freezes (owner_user_id, frozen_at desc);

alter table public.recommendation_learning_baseline_freezes enable row level security;
revoke all on table public.recommendation_learning_baseline_freezes
  from public, anon, authenticated, service_role;

create or replace function public.freeze_recommendation_learning_baseline(
  p_baseline_fingerprint text,
  p_owner_user_id uuid,
  p_segment_key text,
  p_decision_record_fingerprints text[],
  p_evaluation_plan jsonb,
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
  expected_plan_fingerprints text[];
  supplied_fingerprint_count integer;
  distinct_fingerprint_count integer;
begin
  if p_expected_contract_version <> 'recommendation_learning_baseline_freeze_v1'
     or p_baseline_fingerprint is null
     or p_baseline_fingerprint !~ '^[a-f0-9]{64}$'
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
     or jsonb_typeof(p_evaluation_plan->'decision_records') <> 'object'
     or jsonb_typeof(p_evaluation_plan#>'{decision_records,scan_run_fingerprints}') <> 'array'
     or jsonb_typeof(p_evaluation_plan->'metrics') <> 'object' then
    return query select 'unavailable'::text, null::uuid, null::text,
      null::uuid, null::text, null::text[], null::jsonb, null::timestamptz,
      false, 'baseline_freeze_contract_invalid'::text;
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
      null::uuid, null::text, null::text[], null::jsonb, null::timestamptz,
      false, 'baseline_freeze_decision_identities_invalid'::text;
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
      null::uuid, null::text, null::text[], null::jsonb, null::timestamptz,
      false, 'baseline_freeze_plan_identity_mismatch'::text;
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
      null::uuid, null::text, null::text[], null::jsonb, null::timestamptz,
      false, 'baseline_freeze_decision_records_not_owned_or_missing'::text;
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
       and existing.evaluation_plan = p_evaluation_plan then
      return query select 'baseline_already_frozen'::text, existing.id,
        existing.baseline_fingerprint, existing.owner_user_id, existing.segment_key,
        existing.decision_record_fingerprints, existing.evaluation_plan,
        existing.frozen_at, true, null::text;
    else
      return query select 'different_baseline_already_frozen'::text, null::uuid,
        null::text, null::uuid, null::text, null::text[], null::jsonb,
        null::timestamptz, false,
        'different_baseline_already_frozen'::text;
    end if;
    return;
  end if;

  insert into public.recommendation_learning_baseline_freezes (
    baseline_fingerprint,
    owner_user_id,
    segment_key,
    decision_record_fingerprints,
    evaluation_plan
  ) values (
    p_baseline_fingerprint,
    p_owner_user_id,
    p_segment_key,
    p_decision_record_fingerprints,
    p_evaluation_plan
  ) returning * into existing;

  return query select 'baseline_frozen'::text, existing.id,
    existing.baseline_fingerprint, existing.owner_user_id, existing.segment_key,
    existing.decision_record_fingerprints, existing.evaluation_plan,
    existing.frozen_at, false, null::text;
end;
$$;

create or replace function public.read_recommendation_learning_baseline_freeze(
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
      null::uuid, null::text, null::text[], null::jsonb, null::timestamptz,
      'baseline_freeze_read_contract_invalid'::text;
    return;
  end if;

  select * into existing
  from public.recommendation_learning_baseline_freezes as baseline_freeze
  where baseline_freeze.owner_user_id = p_owner_user_id
    and baseline_freeze.contract_version = p_expected_contract_version;

  if not found then
    return query select 'not_found'::text, null::uuid, null::text,
      null::uuid, null::text, null::text[], null::jsonb, null::timestamptz,
      'recommendation_learning_baseline_freeze_not_found'::text;
    return;
  end if;

  return query select 'available'::text, existing.id,
    existing.baseline_fingerprint, existing.owner_user_id, existing.segment_key,
    existing.decision_record_fingerprints, existing.evaluation_plan,
    existing.frozen_at, null::text;
end;
$$;

revoke all on function public.freeze_recommendation_learning_baseline(
  text, uuid, text, text[], jsonb, text
) from public, anon, authenticated;
revoke all on function public.read_recommendation_learning_baseline_freeze(
  uuid, text
) from public, anon, authenticated;
grant execute on function public.freeze_recommendation_learning_baseline(
  text, uuid, text, text[], jsonb, text
) to service_role;
grant execute on function public.read_recommendation_learning_baseline_freeze(
  uuid, text
) to service_role;

comment on table public.recommendation_learning_baseline_freezes is
  'Server-only IF-4 immutable baseline receipts. A receipt binds one owner to an exact ready evaluation plan and its decision-run identities before later shadow policy work. It cannot admit provider data, ranking, publication, execution or broker activity.';

commit;
