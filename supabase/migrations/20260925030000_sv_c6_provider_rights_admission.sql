-- SV-C6: durable provider-rights evidence admission for the first internal-
-- paper pilot.
--
-- The official Twelve Data Basic Free evidence reviewed on 2026-09-25 is
-- deliberately recorded as blocked. It permits internal non-display,
-- non-commercial use and non-reversible derived data, but it does not state a
-- retention duration for the exact prices/candles preserved by C1/C2. This
-- migration performs no provider request, creates no account/policy/job and
-- activates no worker. A future admitted evidence row requires a separately
-- reviewed migration backed by provider/account-specific confirmation.

set lock_timeout = '5s';
set statement_timeout = '60s';

do $$
declare
  v_freeze_function oid := pg_catalog.to_regprocedure(
    'public.app_freeze_internal_paper_pilot_policy_v1(uuid,uuid,text,text,text,integer,bigint,timestamptz)'
  );
begin
  if pg_catalog.to_regclass('public.internal_paper_pilot_policies') is null
    or v_freeze_function is null
  then
    raise exception 'sv_c6_required_c5_contract_missing';
  end if;

  if exists (select 1 from public.internal_paper_pilot_policies) then
    raise exception 'sv_c6_requires_empty_pilot_policy_state';
  end if;

  if pg_catalog.to_regclass(
    'public.internal_paper_provider_rights_evidence'
  ) is not null
    or pg_catalog.to_regprocedure(
      'public.app_read_internal_paper_provider_rights_evidence_v1(text,text)'
    ) is not null
    or exists (
      select 1
      from pg_catalog.pg_attribute attribute
      where attribute.attrelid =
        'public.internal_paper_pilot_policies'::pg_catalog.regclass
        and attribute.attname = 'provider_rights_evidence_id'
        and attribute.attnum > 0
        and not attribute.attisdropped
    )
  then
    raise exception 'sv_c6_preexisting_provider_rights_contract';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_proc procedure_record
    where procedure_record.oid = v_freeze_function
      and procedure_record.prokind = 'f'
      and procedure_record.provolatile = 'v'
      and procedure_record.prosecdef
      and procedure_record.proconfig @>
        array['search_path=pg_catalog, public']::text[]
  ) or not pg_catalog.has_function_privilege(
    'service_role', v_freeze_function, 'EXECUTE'
  ) or pg_catalog.has_function_privilege(
    'anon', v_freeze_function, 'EXECUTE'
  ) or pg_catalog.has_function_privilege(
    'authenticated', v_freeze_function, 'EXECUTE'
  ) then
    raise exception 'sv_c6_unexpected_c5_freeze_boundary';
  end if;
end;
$$;

create table public.internal_paper_provider_rights_evidence (
  evidence_id text primary key
    check (evidence_id ~ '^provider_rights_[a-z0-9_]+_v[0-9]+$'),
  provider_plan text not null
    check (provider_plan = 'twelve_data_basic_free'),
  admission_status text not null
    check (admission_status in ('blocked', 'admitted')),
  evidence_document_path text not null
    check (length(evidence_document_path) between 1 and 500),
  evidence_document_sha256 text not null
    check (evidence_document_sha256 ~ '^[0-9a-f]{64}$'),
  entitlement_evidence_reference text not null
    check (length(entitlement_evidence_reference) between 1 and 500),
  retention_rights_evidence_reference text not null
    check (length(retention_rights_evidence_reference) between 1 and 500),
  internal_non_display_allowed boolean not null,
  noncommercial_use_required boolean not null,
  raw_provider_payload_retention_bytes bigint not null
    check (raw_provider_payload_retention_bytes = 0),
  non_reversible_derived_data_allowed boolean not null,
  max_exact_price_evidence_retention_days integer null
    check (
      max_exact_price_evidence_retention_days is null
      or max_exact_price_evidence_retention_days between 1 and 3650
    ),
  termination_data_deletion_required boolean not null,
  reason_codes text[] not null,
  reviewed_at timestamptz not null,
  source_terms_effective_date date not null,
  created_at timestamptz not null default now(),
  unique (evidence_id, provider_plan),
  unique (
    provider_plan,
    entitlement_evidence_reference,
    retention_rights_evidence_reference
  ),
  check (pg_catalog.cardinality(reason_codes) > 0),
  check (
    (
      admission_status = 'admitted'
      and internal_non_display_allowed
      and non_reversible_derived_data_allowed
      and max_exact_price_evidence_retention_days is not null
    ) or (
      admission_status = 'blocked'
      and max_exact_price_evidence_retention_days is null
    )
  )
);

alter table public.internal_paper_provider_rights_evidence
  enable row level security;
revoke all privileges on table public.internal_paper_provider_rights_evidence
  from public, anon, authenticated, service_role;

insert into public.internal_paper_provider_rights_evidence (
  evidence_id,
  provider_plan,
  admission_status,
  evidence_document_path,
  evidence_document_sha256,
  entitlement_evidence_reference,
  retention_rights_evidence_reference,
  internal_non_display_allowed,
  noncommercial_use_required,
  raw_provider_payload_retention_bytes,
  non_reversible_derived_data_allowed,
  max_exact_price_evidence_retention_days,
  termination_data_deletion_required,
  reason_codes,
  reviewed_at,
  source_terms_effective_date
) values (
  'provider_rights_twelve_data_basic_free_2026_09_25_v1',
  'twelve_data_basic_free',
  'blocked',
  'docs/evidence/sv-c6-twelve-data-basic-free-provider-rights.json',
  'cc49dd0dc111bbe2c737a91a4f477de71fbcd5b6414394af6df9e0365140be3b',
  'official:twelve_data_pricing_and_personal_usage:reviewed_2026_09_25',
  'official:twelve_data_terms_sections_2_6_12_16:effective_2026_01_01:reviewed_2026_09_25',
  true,
  true,
  0,
  true,
  null,
  true,
  array[
    'exact_price_evidence_retention_duration_unverified',
    'account_specific_third_party_terms_unverified'
  ]::text[],
  '2026-09-25T02:30:00.000Z',
  '2026-01-01'
);

alter table public.internal_paper_pilot_policies
  add column provider_rights_evidence_id text not null,
  add constraint internal_paper_pilot_policies_provider_rights_fk
    foreign key (provider_rights_evidence_id, provider_plan)
    references public.internal_paper_provider_rights_evidence(
      evidence_id, provider_plan
    ) on delete restrict;

create index internal_paper_pilot_policies_provider_rights_idx
  on public.internal_paper_pilot_policies(
    provider_rights_evidence_id, provider_plan
  );

create or replace function public.app_freeze_internal_paper_pilot_policy_v1(
  p_owner_user_id uuid,
  p_account_id uuid,
  p_policy_version text,
  p_entitlement_evidence_reference text,
  p_retention_rights_evidence_reference text,
  p_derived_evidence_retention_days integer,
  p_max_derived_evidence_bytes bigint,
  p_frozen_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_account public.internal_paper_accounts%rowtype;
  v_rights public.internal_paper_provider_rights_evidence%rowtype;
  v_existing public.internal_paper_pilot_policies%rowtype;
  v_disposition text := 'created';
begin
  if p_owner_user_id is null or p_account_id is null
    or p_policy_version is distinct from
      'internal_paper_pilot_operating_policy_2026_09_22_v1'
    or p_entitlement_evidence_reference is null
    or length(p_entitlement_evidence_reference) not between 1 and 500
    or p_retention_rights_evidence_reference is null
    or length(p_retention_rights_evidence_reference) not between 1 and 500
    or p_derived_evidence_retention_days is null
    or p_derived_evidence_retention_days not between 1 and 3650
    or p_max_derived_evidence_bytes is null
    or p_max_derived_evidence_bytes not between 1048576 and 10737418240
    or p_frozen_at is null
  then raise exception 'invalid_internal_paper_pilot_policy'; end if;

  select * into v_account
  from public.internal_paper_accounts account
  where account.id = p_account_id
    and account.owner_user_id = p_owner_user_id
  for update;
  if not found then raise exception 'internal_paper_account_not_found'; end if;
  if v_account.status <> 'paused' then
    raise exception 'internal_paper_policy_requires_paused_account';
  end if;

  select * into v_rights
  from public.internal_paper_provider_rights_evidence rights
  where rights.provider_plan = 'twelve_data_basic_free'
    and rights.entitlement_evidence_reference =
      p_entitlement_evidence_reference
    and rights.retention_rights_evidence_reference =
      p_retention_rights_evidence_reference;
  if not found or v_rights.admission_status <> 'admitted' then
    raise exception 'internal_paper_provider_rights_not_admitted';
  end if;
  if v_rights.max_exact_price_evidence_retention_days is null
    or p_derived_evidence_retention_days >
      v_rights.max_exact_price_evidence_retention_days
  then
    raise exception 'internal_paper_provider_rights_retention_exceeded';
  end if;

  select * into v_existing
  from public.internal_paper_pilot_policies policy
  where policy.account_id = p_account_id
  for share;
  if found then
    if v_existing.owner_user_id is distinct from p_owner_user_id
      or v_existing.policy_version is distinct from p_policy_version
      or v_existing.provider_rights_evidence_id is distinct from
        v_rights.evidence_id
      or v_existing.entitlement_evidence_reference is distinct from
        p_entitlement_evidence_reference
      or v_existing.retention_rights_evidence_reference is distinct from
        p_retention_rights_evidence_reference
      or v_existing.derived_evidence_retention_days is distinct from
        p_derived_evidence_retention_days
      or v_existing.max_derived_evidence_bytes is distinct from
        p_max_derived_evidence_bytes
      or v_existing.frozen_at is distinct from p_frozen_at
    then raise exception 'internal_paper_pilot_policy_conflict'; end if;
    v_disposition := 'reused';
  else
    insert into public.internal_paper_pilot_policies(
      account_id, owner_user_id, policy_version, provider_plan,
      provider_rights_evidence_id, entitlement_evidence_reference,
      retention_rights_evidence_reference, derived_evidence_retention_days,
      max_derived_evidence_bytes, frozen_at
    ) values (
      p_account_id, p_owner_user_id, p_policy_version,
      'twelve_data_basic_free', v_rights.evidence_id,
      p_entitlement_evidence_reference,
      p_retention_rights_evidence_reference,
      p_derived_evidence_retention_days, p_max_derived_evidence_bytes,
      p_frozen_at
    ) returning * into v_existing;
  end if;

  return jsonb_build_object(
    'policy_version', v_existing.policy_version,
    'account_id', v_existing.account_id,
    'owner_user_id', v_existing.owner_user_id,
    'disposition', v_disposition,
    'provider_plan', v_existing.provider_plan,
    'provider_rights_evidence_id', v_existing.provider_rights_evidence_id,
    'max_daily_provider_credits', v_existing.max_daily_provider_credits,
    'max_per_minute_provider_credits', v_existing.max_per_minute_provider_credits,
    'retry_reserve_credits', v_existing.retry_reserve_credits,
    'max_raw_provider_payload_bytes', v_existing.max_raw_provider_payload_bytes,
    'max_derived_evidence_bytes', v_existing.max_derived_evidence_bytes,
    'derived_evidence_retention_days', v_existing.derived_evidence_retention_days,
    'monthly_incremental_spend_cap_usd', v_existing.monthly_incremental_spend_cap_usd,
    'max_source_age_seconds', v_existing.max_source_age_seconds,
    'max_decision_to_intent_seconds', v_existing.max_decision_to_intent_seconds,
    'worker_heartbeat_interval_seconds', v_existing.worker_heartbeat_interval_seconds,
    'worker_detection_timeout_seconds', v_existing.worker_detection_timeout_seconds,
    'max_scan_runtime_seconds', v_existing.max_scan_runtime_seconds,
    'restart_reconciliation_deadline_seconds',
      v_existing.restart_reconciliation_deadline_seconds,
    'acknowledged_effect_recovery_point_seconds',
      v_existing.acknowledged_effect_recovery_point_seconds,
    'frozen_at', v_existing.frozen_at
  );
end;
$$;

revoke all on function public.app_freeze_internal_paper_pilot_policy_v1(
  uuid, uuid, text, text, text, integer, bigint, timestamptz
) from public, anon, authenticated;
grant execute on function public.app_freeze_internal_paper_pilot_policy_v1(
  uuid, uuid, text, text, text, integer, bigint, timestamptz
) to service_role;

create function public.app_read_internal_paper_provider_rights_evidence_v1(
  p_evidence_id text,
  p_reader_version text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_evidence public.internal_paper_provider_rights_evidence%rowtype;
begin
  if p_reader_version is distinct from
    'internal_paper_provider_rights_evidence_reader_v1'
    or p_evidence_id is null
    or length(p_evidence_id) not between 1 and 120
  then raise exception 'invalid_internal_paper_provider_rights_evidence_read';
  end if;

  select * into v_evidence
  from public.internal_paper_provider_rights_evidence evidence
  where evidence.evidence_id = p_evidence_id;
  if not found then
    raise exception 'internal_paper_provider_rights_evidence_not_found';
  end if;

  return jsonb_build_object(
    'reader_version', p_reader_version,
    'evidence_id', v_evidence.evidence_id,
    'provider_plan', v_evidence.provider_plan,
    'admission_status', v_evidence.admission_status,
    'evidence_document_path', v_evidence.evidence_document_path,
    'evidence_document_sha256', v_evidence.evidence_document_sha256,
    'internal_non_display_allowed', v_evidence.internal_non_display_allowed,
    'noncommercial_use_required', v_evidence.noncommercial_use_required,
    'raw_provider_payload_retention_bytes',
      v_evidence.raw_provider_payload_retention_bytes,
    'non_reversible_derived_data_allowed',
      v_evidence.non_reversible_derived_data_allowed,
    'max_exact_price_evidence_retention_days',
      v_evidence.max_exact_price_evidence_retention_days,
    'termination_data_deletion_required',
      v_evidence.termination_data_deletion_required,
    'reason_codes', to_jsonb(v_evidence.reason_codes),
    'reviewed_at', v_evidence.reviewed_at,
    'source_terms_effective_date', v_evidence.source_terms_effective_date
  );
end;
$$;

revoke all on function public.app_read_internal_paper_provider_rights_evidence_v1(
  text, text
) from public, anon, authenticated;
grant execute on function public.app_read_internal_paper_provider_rights_evidence_v1(
  text, text
) to service_role;

comment on table public.internal_paper_provider_rights_evidence is
  'SV-C6 immutable reviewed provider-rights evidence. Only admitted rows may unlock a C5 policy; the initial Basic Free record is intentionally blocked.';
comment on column public.internal_paper_pilot_policies.provider_rights_evidence_id is
  'Immutable SV-C6 rights admission bound to the internal-paper operating policy.';
