-- Action 637: one immutable legacy compatibility target. This does not widen the
-- canonical manual-claim policy or mutate any historical execution data.

create or replace function public.ci_hur_target_claim_id_allowed(p_claim_id text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select p_claim_id ~ '^canary_claim_manual_canary_execution_[0-9]{8}_manual_canary_authorization_[0-9a-f-]{36}$'
    or p_claim_id = 'canary_claim_canary_execution_20260723_8feacb91';
$$;

create or replace function public.ci_hur_reconcile(
  p_authorization_id text, p_reconciliation_identity text, p_target_claim_id text, p_expected_source_audit_id text,
  p_expected_claim_capacity_units smallint, p_expected_ordinary_ledger_units smallint,
  p_expected_reconciliation_units smallint, p_expected_missing_usage_units smallint,
  p_deployment_commit text, p_contract_version text, p_evidence_digest text
)
returns table (
  outcome text, reconciliation_identity text, target_claim_id text, authorization_id text,
  ordinary_ledger_units smallint, reconciliation_units smallint, total_accounted_usage_units smallint
)
language plpgsql security definer set search_path = public
as $$
declare
  authorization_row public.ci_hur_authorizations%rowtype;
  claim_row public.continuous_intelligence_shadow_canary_daily_claims%rowtype;
  source_audit public.bounded_shadow_collector_proof_audits%rowtype;
  legacy_ledger public.continuous_intelligence_credit_ledger%rowtype;
  existing_reconciliation public.ci_hur_reconciliations%rowtype;
  ordinary_units smallint;
  reconciliation_count smallint;
  claim_capacity smallint;
  reconciliation_audit_identity text;
begin
  if p_contract_version is distinct from 'continuous_intelligence_shadow_canary_historical_usage_reconciliation_v1' or
     p_authorization_id is null or p_reconciliation_identity is null or p_target_claim_id is null or p_expected_source_audit_id is null or
     p_expected_claim_capacity_units is distinct from 2 or p_expected_ordinary_ledger_units is distinct from 1 or
     p_expected_reconciliation_units is distinct from 0 or p_expected_missing_usage_units is distinct from 1 or
     p_evidence_digest is null or p_evidence_digest !~ '^[0-9a-f]{64}$' or
     not public.ci_hur_target_claim_id_allowed(p_target_claim_id) or
     p_reconciliation_identity is distinct from 'historical_manual_usage_reconciliation:continuous_intelligence_shadow_canary_historical_usage_reconciliation_v1:' || p_target_claim_id then
    return query select 'historical_state_malformed'::text, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  perform pg_advisory_xact_lock(hashtext('ci_hur_reconcile:' || p_target_claim_id));
  select * into existing_reconciliation from public.ci_hur_reconciliations as reconciliation_row where reconciliation_row.target_claim_id = p_target_claim_id for update;
  if found then
    if existing_reconciliation.reconciliation_identity = p_reconciliation_identity and existing_reconciliation.target_claim_id = p_target_claim_id then
      return query select 'reconciliation_already_applied'::text, existing_reconciliation.reconciliation_identity, existing_reconciliation.target_claim_id, existing_reconciliation.authorization_id, 1::smallint, 1::smallint, 2::smallint;
      return;
    end if;
    return query select 'reconciliation_identity_conflict'::text, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  select * into existing_reconciliation from public.ci_hur_reconciliations as reconciliation_row where reconciliation_row.reconciliation_identity = p_reconciliation_identity for update;
  if found then
    return query select 'reconciliation_identity_conflict'::text, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  select * into authorization_row from public.ci_hur_authorizations as authorization_state where authorization_state.authorization_id = p_authorization_id for update;
  if not found then
    return query select 'authorization_not_found'::text, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  if authorization_row.operation_type <> 'historical_manual_usage_ledger_reconciliation' then
    return query select 'authorization_operation_mismatch'::text, null::text, null::text, authorization_row.authorization_id, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  if authorization_row.target_claim_id <> p_target_claim_id or authorization_row.source_audit_id <> p_expected_source_audit_id or authorization_row.reconciliation_identity <> p_reconciliation_identity then
    return query select 'authorization_target_mismatch'::text, null::text, null::text, authorization_row.authorization_id, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  if authorization_row.deployment_commit <> p_deployment_commit then
    return query select 'deployment_binding_mismatch'::text, null::text, null::text, authorization_row.authorization_id, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  if authorization_row.status = 'consumed' then
    return query select 'authorization_already_consumed'::text, null::text, null::text, authorization_row.authorization_id, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  if authorization_row.status <> 'issued' or authorization_row.expires_at <= now() then
    if authorization_row.status = 'issued' then
      update public.ci_hur_authorizations as authorization_state set status = 'expired' where authorization_state.authorization_id = authorization_row.authorization_id;
    end if;
    return query select 'authorization_expired'::text, null::text, null::text, authorization_row.authorization_id, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  if authorization_row.expected_claim_capacity_units <> p_expected_claim_capacity_units or authorization_row.expected_ordinary_ledger_units <> p_expected_ordinary_ledger_units or authorization_row.expected_reconciliation_units <> p_expected_reconciliation_units or authorization_row.expected_missing_usage_units <> p_expected_missing_usage_units or authorization_row.evidence_digest <> p_evidence_digest then
    return query select 'reconciliation_precondition_mismatch'::text, null::text, null::text, authorization_row.authorization_id, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  select * into claim_row from public.continuous_intelligence_shadow_canary_daily_claims as target_claim where target_claim.claim_id = p_target_claim_id for update;
  if not found then
    return query select 'target_claim_not_found'::text, null::text, null::text, authorization_row.authorization_id, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  if claim_row.status <> 'completed' or claim_row.provider_attempted is not true or claim_row.source_receipt_id is null then
    return query select 'target_claim_not_completed'::text, null::text, null::text, authorization_row.authorization_id, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  if not public.ci_hur_target_allowed(claim_row.claim_id, claim_row.execution_id, claim_row.source_receipt_id) then
    return query select 'target_claim_scope_mismatch'::text, null::text, null::text, authorization_row.authorization_id, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  select * into source_audit from public.bounded_shadow_collector_proof_audits as matched_audit where matched_audit.receipt_id = p_expected_source_audit_id and matched_audit.daily_claim_id = claim_row.claim_id for update;
  if not found then
    return query select 'source_audit_missing'::text, null::text, null::text, authorization_row.authorization_id, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  if source_audit.entry_kind <> 'bounded_manual_proof' or source_audit.daily_claim_status <> 'completed' or source_audit.daily_claim_execution_id <> claim_row.execution_id or source_audit.provider_attempt_occurred is not true or source_audit.provider_request_count <> 1 or source_audit.receipt_id <> claim_row.source_receipt_id then
    return query select 'source_audit_mismatch'::text, null::text, null::text, authorization_row.authorization_id, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  if not public.ci_hur_target_provider_result_allowed(claim_row.claim_id, claim_row.execution_id, claim_row.source_receipt_id, source_audit.primary_result_category) then
    return query select 'provider_usage_unverified'::text, null::text, null::text, authorization_row.authorization_id, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  select * into legacy_ledger from public.continuous_intelligence_credit_ledger as legacy_entry where legacy_entry.source_receipt_id = claim_row.source_receipt_id for update;
  if not found or legacy_ledger.durable_audit_persisted is not false then
    return query select 'ledger_failure_evidence_mismatch'::text, null::text, null::text, authorization_row.authorization_id, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  if legacy_ledger.generated_at = source_audit.generated_at then
    return query select 'ordinary_ledger_already_present'::text, null::text, null::text, authorization_row.authorization_id, null::smallint, null::smallint, null::smallint;
    return;
  end if;
  select count(*)::smallint into claim_capacity from public.continuous_intelligence_shadow_canary_daily_claims as day_claim where day_claim.utc_day = claim_row.utc_day;
  select coalesce(sum(ordinary_entry.provider_estimated_credits), 0)::smallint into ordinary_units from public.continuous_intelligence_credit_ledger as ordinary_entry where ordinary_entry.entry_kind = 'bounded_manual_proof' and ordinary_entry.generated_at >= claim_row.utc_day and ordinary_entry.generated_at < claim_row.utc_day + interval '1 day';
  select count(*)::smallint into reconciliation_count from public.ci_hur_reconciliations as existing_entry where existing_entry.historical_utc_day = claim_row.utc_day;
  if claim_capacity <> 2 or ordinary_units <> 1 or reconciliation_count <> 0 then
    return query select 'reconciliation_precondition_mismatch'::text, null::text, null::text, authorization_row.authorization_id, ordinary_units, reconciliation_count, ordinary_units + reconciliation_count;
    return;
  end if;
  update public.ci_hur_authorizations as authorization_state set status = 'consumed', consumed_at = now(), consumed_reconciliation_identity = p_reconciliation_identity where authorization_state.authorization_id = authorization_row.authorization_id and authorization_state.status = 'issued';
  if not found then raise exception 'historical usage reconciliation authorization consumption lost atomic state'; end if;
  insert into public.ci_hur_reconciliations (reconciliation_identity, contract_version, operation_type, target_claim_id, source_execution_id, source_audit_id, authorization_id, provider, usage_units, provider_request_count_for_reconciliation, reason_code, evidence_digest, historical_utc_day, historical_provider_event_at, authorized_at, reconciled_at, deployment_commit)
  values (p_reconciliation_identity, p_contract_version, authorization_row.operation_type, claim_row.claim_id, claim_row.execution_id, source_audit.receipt_id, authorization_row.authorization_id, 'twelve_data', 1, 0, 'verified_post_provider_receipt_identity_collision', p_evidence_digest, claim_row.utc_day, source_audit.generated_at, authorization_row.issued_at, now(), authorization_row.deployment_commit);
  reconciliation_audit_identity := 'historical_usage_reconciliation_audit:' || p_reconciliation_identity;
  insert into public.ci_hur_audits (audit_identity, reconciliation_identity, target_claim_id, source_audit_id, authorization_id, before_claim_capacity_units, before_ordinary_ledger_units, before_reconciliation_units, expected_missing_usage_units, after_total_accounted_usage_units, eligibility_classification, source_failure_classification, final_result, requested_by, reason_code, deployment_commit, persisted_at)
  values (reconciliation_audit_identity, p_reconciliation_identity, claim_row.claim_id, source_audit.receipt_id, authorization_row.authorization_id, 2, 1, 0, 1, 2, 'eligible_verified_post_provider_ledger_failure', 'verified_post_provider_receipt_identity_collision', 'reconciliation_applied', authorization_row.requested_by, 'verified_post_provider_receipt_identity_collision', authorization_row.deployment_commit, now());
  select count(*)::smallint into reconciliation_count from public.ci_hur_reconciliations as inserted_entry where inserted_entry.historical_utc_day = claim_row.utc_day;
  if claim_capacity <> 2 or ordinary_units <> 1 or reconciliation_count <> 1 or ordinary_units + reconciliation_count <> 2 then raise exception 'historical usage reconciliation postcondition failed'; end if;
  return query select 'reconciliation_applied'::text, p_reconciliation_identity, claim_row.claim_id, authorization_row.authorization_id, ordinary_units, reconciliation_count, ordinary_units + reconciliation_count;
exception when unique_violation then
  return query select 'reconciliation_identity_conflict'::text, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint;
when others then
  return query select 'historical_state_unavailable'::text, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint;
end;
$$;

create or replace function public.ci_hur_target_allowed(
  p_claim_id text,
  p_execution_id text,
  p_source_receipt_id text
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select p_claim_id ~ '^canary_claim_manual_canary_execution_[0-9]{8}_manual_canary_authorization_[0-9a-f-]{36}$'
    or (
      p_claim_id = 'canary_claim_canary_execution_20260723_8feacb91'
      and p_execution_id = 'canary_execution_20260723_8feacb91'
      and p_source_receipt_id = 'canary_receipt_AAPL_5min_2026-07-22T19-30-00.000Z_2026-07-22T20-00-00.000Z'
    );
$$;

create or replace function public.ci_hur_target_provider_result_allowed(
  p_claim_id text,
  p_execution_id text,
  p_source_receipt_id text,
  p_primary_result_category text
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select (
    p_claim_id ~ '^canary_claim_manual_canary_execution_[0-9]{8}_manual_canary_authorization_[0-9a-f-]{36}$'
    and p_primary_result_category in ('provider_success_with_candles', 'provider_success_empty')
  ) or (
    p_claim_id = 'canary_claim_canary_execution_20260723_8feacb91'
    and p_execution_id = 'canary_execution_20260723_8feacb91'
    and p_source_receipt_id = 'canary_receipt_AAPL_5min_2026-07-22T19-30-00.000Z_2026-07-22T20-00-00.000Z'
    and p_primary_result_category = 'provider_success_with_candles'
  );
$$;

create or replace function public.ci_hur_issue(
  p_authorization_id text, p_target_claim_id text, p_source_audit_id text, p_reconciliation_identity text,
  p_expected_claim_capacity_units smallint, p_expected_ordinary_ledger_units smallint,
  p_expected_reconciliation_units smallint, p_expected_missing_usage_units smallint,
  p_evidence_digest text, p_requested_by text, p_deployment_commit text, p_issued_at timestamptz, p_expires_at timestamptz
)
returns table (outcome text, authorization_id text, reconciliation_identity text)
language plpgsql security definer set search_path = public
as $$
declare
  existing public.ci_hur_authorizations%rowtype;
  claim_row public.continuous_intelligence_shadow_canary_daily_claims%rowtype;
  source_audit public.bounded_shadow_collector_proof_audits%rowtype;
  legacy_ledger public.continuous_intelligence_credit_ledger%rowtype;
  ordinary_units smallint;
  reconciliation_count smallint;
  claim_capacity smallint;
begin
  if p_expires_at is null or p_issued_at is null or p_expires_at <= p_issued_at or p_expires_at > p_issued_at + interval '300 seconds' or
     p_expected_claim_capacity_units is distinct from 2 or p_expected_ordinary_ledger_units is distinct from 1 or
     p_expected_reconciliation_units is distinct from 0 or p_expected_missing_usage_units is distinct from 1 or
     p_authorization_id is null or length(p_authorization_id) not between 1 and 160 or
     not public.ci_hur_target_claim_id_allowed(p_target_claim_id) or
     p_source_audit_id is null or length(p_source_audit_id) not between 1 and 128 or
     p_reconciliation_identity is distinct from 'historical_manual_usage_reconciliation:continuous_intelligence_shadow_canary_historical_usage_reconciliation_v1:' || p_target_claim_id or
     p_evidence_digest is null or p_evidence_digest !~ '^[0-9a-f]{64}$' or
     p_requested_by is null or length(p_requested_by) not between 1 and 160 or
     p_deployment_commit is null or length(p_deployment_commit) not between 1 and 128 then
    return query select 'historical_state_malformed'::text, null::text, null::text;
    return;
  end if;
  perform pg_advisory_xact_lock(hashtext('ci_hur_authorization:' || p_target_claim_id));
  select * into existing from public.ci_hur_authorizations as authorization_row where authorization_row.authorization_id = p_authorization_id for update;
  if found then
    if existing.target_claim_id = p_target_claim_id and existing.reconciliation_identity = p_reconciliation_identity then
      return query select 'already_issued'::text, existing.authorization_id, existing.reconciliation_identity;
    end if;
    return query select 'authorization_target_mismatch'::text, null::text, null::text;
    return;
  end if;
  select * into claim_row from public.continuous_intelligence_shadow_canary_daily_claims as target_claim where target_claim.claim_id = p_target_claim_id for update;
  if not found then
    return query select 'target_claim_not_found'::text, null::text, null::text;
    return;
  end if;
  if claim_row.status <> 'completed' or claim_row.provider_attempted is not true or claim_row.source_receipt_id is null then
    return query select 'target_claim_not_completed'::text, null::text, null::text;
    return;
  end if;
  if not public.ci_hur_target_allowed(claim_row.claim_id, claim_row.execution_id, claim_row.source_receipt_id) then
    return query select 'target_claim_scope_mismatch'::text, null::text, null::text;
    return;
  end if;
  select * into source_audit from public.bounded_shadow_collector_proof_audits as matched_audit where matched_audit.receipt_id = p_source_audit_id and matched_audit.daily_claim_id = claim_row.claim_id for update;
  if not found then
    return query select 'source_audit_missing'::text, null::text, null::text;
    return;
  end if;
  if source_audit.entry_kind <> 'bounded_manual_proof' or source_audit.daily_claim_status <> 'completed' or
     source_audit.daily_claim_execution_id <> claim_row.execution_id or source_audit.provider_attempt_occurred is not true or
     source_audit.provider_request_count <> 1 or source_audit.receipt_id <> claim_row.source_receipt_id then
    return query select 'source_audit_mismatch'::text, null::text, null::text;
    return;
  end if;
  if not public.ci_hur_target_provider_result_allowed(claim_row.claim_id, claim_row.execution_id, claim_row.source_receipt_id, source_audit.primary_result_category) then
    return query select 'provider_usage_unverified'::text, null::text, null::text;
    return;
  end if;
  select * into legacy_ledger from public.continuous_intelligence_credit_ledger as legacy_entry where legacy_entry.source_receipt_id = claim_row.source_receipt_id for update;
  if not found or legacy_ledger.durable_audit_persisted is not false then
    return query select 'ledger_failure_evidence_mismatch'::text, null::text, null::text;
    return;
  end if;
  if legacy_ledger.generated_at = source_audit.generated_at then
    return query select 'ordinary_ledger_already_present'::text, null::text, null::text;
    return;
  end if;
  select count(*)::smallint into claim_capacity from public.continuous_intelligence_shadow_canary_daily_claims as day_claim where day_claim.utc_day = claim_row.utc_day;
  select coalesce(sum(ordinary_entry.provider_estimated_credits), 0)::smallint into ordinary_units from public.continuous_intelligence_credit_ledger as ordinary_entry where ordinary_entry.entry_kind = 'bounded_manual_proof' and ordinary_entry.generated_at >= claim_row.utc_day and ordinary_entry.generated_at < claim_row.utc_day + interval '1 day';
  select count(*)::smallint into reconciliation_count from public.ci_hur_reconciliations as existing_entry where existing_entry.historical_utc_day = claim_row.utc_day;
  if claim_capacity <> 2 or ordinary_units <> 1 or reconciliation_count <> 0 then
    return query select 'reconciliation_precondition_mismatch'::text, null::text, null::text;
    return;
  end if;
  insert into public.ci_hur_authorizations (authorization_id, target_claim_id, source_audit_id, reconciliation_identity, expected_claim_capacity_units, expected_ordinary_ledger_units, expected_reconciliation_units, expected_missing_usage_units, evidence_digest, requested_by, deployment_commit, issued_at, expires_at)
  values (p_authorization_id, p_target_claim_id, p_source_audit_id, p_reconciliation_identity, p_expected_claim_capacity_units, p_expected_ordinary_ledger_units, p_expected_reconciliation_units, p_expected_missing_usage_units, p_evidence_digest, p_requested_by, p_deployment_commit, p_issued_at, p_expires_at);
  return query select 'issued'::text, p_authorization_id, p_reconciliation_identity;
exception when unique_violation then
  return query select 'reconciliation_identity_conflict'::text, null::text, null::text;
end;
$$;

revoke all on function public.ci_hur_target_claim_id_allowed(text) from public, anon, authenticated, service_role;
revoke all on function public.ci_hur_target_allowed(text, text, text) from public, anon, authenticated, service_role;
revoke all on function public.ci_hur_target_provider_result_allowed(text, text, text, text) from public, anon, authenticated, service_role;
revoke all on function public.ci_hur_issue(text, text, text, text, smallint, smallint, smallint, smallint, text, text, text, timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function public.ci_hur_reconcile(text, text, text, text, smallint, smallint, smallint, smallint, text, text, text) from public, anon, authenticated;
grant execute on function public.ci_hur_issue(text, text, text, text, smallint, smallint, smallint, smallint, text, text, text, timestamptz, timestamptz) to service_role;
grant execute on function public.ci_hur_reconcile(text, text, text, text, smallint, smallint, smallint, smallint, text, text, text) to service_role;

comment on function public.ci_hur_target_allowed(text, text, text) is
  'Action 637 private target policy: canonical manual claims plus one exact Action 609 evidence triple.';
