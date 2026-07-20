-- Action 626: dormant transactional RPCs for Git runner authority consumption.
--
-- This migration creates source-controlled database primitives only. It adds no
-- application caller, runner, Git execution path, process observation path,
-- repository inspection path, credential access, runtime activation, staging
-- behavior, deployment behavior, retry, fallback, cache, or automatic reissue.

create function public.register_git_runner_authority_package(
  p_consumption_key text,
  p_authority_package_id text,
  p_authority_package_fingerprint text,
  p_authority_policy_fingerprint text,
  p_schema_identity text,
  p_schema_version integer,
  p_package_contract_identity text,
  p_package_contract_version integer,
  p_capability_set_identity text,
  p_capability_set_version integer,
  p_expiry_policy_identity text,
  p_expiry_policy_version integer,
  p_freshness_policy_identity text,
  p_freshness_policy_version integer,
  p_session_fingerprint text,
  p_sequence_identity text,
  p_sequence_fingerprint text,
  p_executable_identity text,
  p_executable_fingerprint text,
  p_resolution_fingerprint text,
  p_revalidation_fingerprint text,
  p_worktree_fingerprint text,
  p_compatibility_result_fingerprint text,
  p_platform text,
  p_source_policy_identity text,
  p_source_policy_version integer,
  p_issued_at timestamptz,
  p_expires_at timestamptz,
  p_state_core_fingerprint text,
  p_state_fingerprint text,
  p_stage_0_grant_fingerprint text,
  p_stage_0_authority_fingerprint text,
  p_stage_0_record_fingerprint text,
  p_stage_1_grant_fingerprint text,
  p_stage_1_authority_fingerprint text,
  p_stage_1_record_fingerprint text,
  p_stage_2_grant_fingerprint text,
  p_stage_2_authority_fingerprint text,
  p_stage_2_record_fingerprint text,
  p_stage_3_grant_fingerprint text,
  p_stage_3_authority_fingerprint text,
  p_stage_3_record_fingerprint text,
  p_stage_4_grant_fingerprint text,
  p_stage_4_authority_fingerprint text,
  p_stage_4_record_fingerprint text,
  p_stage_5_grant_fingerprint text,
  p_stage_5_authority_fingerprint text,
  p_stage_5_record_fingerprint text,
  p_observed_at timestamptz,
  p_event_fingerprint text
) returns table (
  status text,
  reason text,
  consumption_record_id uuid,
  consumption_key text,
  authority_package_id text,
  previous_transition_version bigint,
  resulting_transition_version bigint,
  previous_state_fingerprint text,
  state_core_fingerprint text,
  state_fingerprint text,
  audit_event_fingerprint text,
  terminal boolean,
  storage_committed boolean,
  storage_ambiguous boolean,
  runtime_activated boolean,
  authority text,
  toctou_eliminated boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_existing public.git_runner_authority_consumption_records%rowtype;
  v_record_id uuid;
begin
  if p_consumption_key is null
    or length(btrim(p_consumption_key)) = 0
    or p_authority_package_id is null
    or length(btrim(p_authority_package_id)) = 0
    or p_authority_package_fingerprint !~ '^[0-9a-f]{64}$'
    or p_authority_policy_fingerprint !~ '^[0-9a-f]{64}$'
    or p_session_fingerprint !~ '^[0-9a-f]{64}$'
    or p_sequence_fingerprint !~ '^[0-9a-f]{64}$'
    or p_executable_fingerprint !~ '^[0-9a-f]{64}$'
    or p_resolution_fingerprint !~ '^[0-9a-f]{64}$'
    or p_revalidation_fingerprint !~ '^[0-9a-f]{64}$'
    or p_worktree_fingerprint !~ '^[0-9a-f]{64}$'
    or p_compatibility_result_fingerprint !~ '^[0-9a-f]{64}$'
    or p_state_core_fingerprint !~ '^[0-9a-f]{64}$'
    or p_state_fingerprint !~ '^[0-9a-f]{64}$'
    or p_event_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_0_grant_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_0_authority_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_0_record_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_1_grant_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_1_authority_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_1_record_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_2_grant_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_2_authority_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_2_record_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_3_grant_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_3_authority_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_3_record_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_4_grant_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_4_authority_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_4_record_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_5_grant_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_5_authority_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_5_record_fingerprint !~ '^[0-9a-f]{64}$'
    or p_schema_identity <> 'ture.execution.dormant-git-runner-authority-consumption-storage.schema-family.v1'
    or p_schema_version <> 1
    or p_package_contract_identity <> 'ture.execution.pure-dormant-git-runner-authority-package-contract.fixture.v1'
    or p_package_contract_version <> 1
    or p_capability_set_identity <> 'ture.execution.read-only-git-repository-observation-capability-set.v1'
    or p_capability_set_version <> 1
    or p_expiry_policy_identity <> 'ture.execution.dormant-git-runner-authority-expiry-policy.v1'
    or p_expiry_policy_version <> 1
    or p_freshness_policy_identity <> 'ture.execution.dormant-git-runner-authority-freshness-policy.v1'
    or p_freshness_policy_version <> 1
    or p_sequence_identity <> 'ture.execution.read-only-git-repository-observation.sequence.root-object-format-head-branch-status-head.v1'
    or p_executable_identity <> '/usr/bin/git'
    or p_platform <> 'macos'
    or p_source_policy_identity <> 'pure_raw_process_completion_evidence_contract_policy_v1'
    or p_source_policy_version <> 1
    or p_expires_at <> p_issued_at + interval '30 seconds'
    or p_observed_at >= p_expires_at then
    return query select 'transition_rejected', 'input_contract_rejected', null::uuid, p_consumption_key, p_authority_package_id, null::bigint, null::bigint, null::text, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;

  select * into v_existing
  from public.git_runner_authority_consumption_records r
  where r.consumption_key = p_consumption_key
     or r.authority_package_id = p_authority_package_id
     or r.authority_package_fingerprint = p_authority_package_fingerprint
  for update;

  if found then
    if v_existing.authority_package_id = p_authority_package_id
      and v_existing.authority_package_fingerprint = p_authority_package_fingerprint then
      return query select 'transition_rejected', 'duplicate_registration_rejected', v_existing.id, p_consumption_key, p_authority_package_id, v_existing.transition_version, null::bigint, v_existing.state_fingerprint, null::text, null::text, null::text, v_existing.terminal, false, false, false, 'none', false;
    elsif v_existing.authority_package_id = p_authority_package_id then
      return query select 'transition_rejected', 'package_identity_conflict_rejected', v_existing.id, p_consumption_key, p_authority_package_id, v_existing.transition_version, null::bigint, v_existing.state_fingerprint, null::text, null::text, null::text, v_existing.terminal, false, false, false, 'none', false;
    elsif v_existing.authority_package_fingerprint = p_authority_package_fingerprint then
      return query select 'transition_rejected', 'package_fingerprint_reuse_rejected', v_existing.id, p_consumption_key, p_authority_package_id, v_existing.transition_version, null::bigint, v_existing.state_fingerprint, null::text, null::text, null::text, v_existing.terminal, false, false, false, 'none', false;
    else
      return query select 'transition_rejected', 'package_identity_conflict_rejected', v_existing.id, p_consumption_key, p_authority_package_id, v_existing.transition_version, null::bigint, v_existing.state_fingerprint, null::text, null::text, null::text, v_existing.terminal, false, false, false, 'none', false;
    end if;
    return;
  end if;

  insert into public.git_runner_authority_consumption_records (
    consumption_key, authority_package_id, authority_package_fingerprint, authority_policy_fingerprint,
    schema_identity, schema_version, package_contract_identity, package_contract_version,
    capability_set_identity, capability_set_version, expiry_policy_identity, expiry_policy_version,
    freshness_policy_identity, freshness_policy_version, session_fingerprint, sequence_identity,
    sequence_fingerprint, executable_identity, executable_fingerprint, resolution_fingerprint,
    revalidation_fingerprint, worktree_fingerprint, compatibility_result_fingerprint, platform,
    source_policy_identity, source_policy_version, issued_at, expires_at, state,
    current_stage_index, consumed_stage_count, remaining_stage_count, transition_version,
    active_consumer_id, active_consumer_fingerprint, active_consumer_claimed_at, terminal,
    terminal_reason, terminal_at, expired, revoked, retry_count, fallback_attempted,
    aggregate_fingerprint, state_core_fingerprint, state_fingerprint, next_audit_sequence,
    last_audit_event_fingerprint, created_at, updated_at, last_transition_at
  ) values (
    p_consumption_key, p_authority_package_id, p_authority_package_fingerprint, p_authority_policy_fingerprint,
    p_schema_identity, p_schema_version, p_package_contract_identity, p_package_contract_version,
    p_capability_set_identity, p_capability_set_version, p_expiry_policy_identity, p_expiry_policy_version,
    p_freshness_policy_identity, p_freshness_policy_version, p_session_fingerprint, p_sequence_identity,
    p_sequence_fingerprint, p_executable_identity, p_executable_fingerprint, p_resolution_fingerprint,
    p_revalidation_fingerprint, p_worktree_fingerprint, p_compatibility_result_fingerprint, p_platform,
    p_source_policy_identity, p_source_policy_version, p_issued_at, p_expires_at, 'issued',
    0, 0, 6, 1,
    null, null, null, false,
    null, null, false, false, 0, false,
    null, p_state_core_fingerprint, p_state_fingerprint, 2,
    p_event_fingerprint, p_observed_at, p_observed_at, p_observed_at
  ) returning id into v_record_id;

  insert into public.git_runner_authority_consumption_stages (
    consumption_record_id, stage_index, stage_identity, authority_policy_fingerprint,
    stage_grant_fingerprint, stage_authority_fingerprint, stage_transition_version,
    stage_record_fingerprint, created_at, updated_at
  ) values
    (v_record_id, 0, 'git_repository_root_v1', p_authority_policy_fingerprint, p_stage_0_grant_fingerprint, p_stage_0_authority_fingerprint, 1, p_stage_0_record_fingerprint, p_observed_at, p_observed_at),
    (v_record_id, 1, 'git_object_format_v1', p_authority_policy_fingerprint, p_stage_1_grant_fingerprint, p_stage_1_authority_fingerprint, 1, p_stage_1_record_fingerprint, p_observed_at, p_observed_at),
    (v_record_id, 2, 'git_head_before_v1', p_authority_policy_fingerprint, p_stage_2_grant_fingerprint, p_stage_2_authority_fingerprint, 1, p_stage_2_record_fingerprint, p_observed_at, p_observed_at),
    (v_record_id, 3, 'git_branch_state_v1', p_authority_policy_fingerprint, p_stage_3_grant_fingerprint, p_stage_3_authority_fingerprint, 1, p_stage_3_record_fingerprint, p_observed_at, p_observed_at),
    (v_record_id, 4, 'git_porcelain_status_v1', p_authority_policy_fingerprint, p_stage_4_grant_fingerprint, p_stage_4_authority_fingerprint, 1, p_stage_4_record_fingerprint, p_observed_at, p_observed_at),
    (v_record_id, 5, 'git_head_after_v1', p_authority_policy_fingerprint, p_stage_5_grant_fingerprint, p_stage_5_authority_fingerprint, 1, p_stage_5_record_fingerprint, p_observed_at, p_observed_at);

  insert into public.git_runner_authority_consumption_audit_events (
    consumption_record_id, authority_package_id, authority_package_fingerprint, authority_policy_fingerprint,
    consumption_key, consumer_fingerprint, stage_index, stage_identity, event_sequence,
    operation_identity, event_status, event_reason, transition_version_before,
    transition_version_after, observed_at, previous_state_fingerprint, next_state_core_fingerprint,
    next_state_fingerprint, relevant_evidence_fingerprint, prior_event_fingerprint, event_fingerprint,
    runtime_activated, authority, toctou_eliminated, created_at
  ) values (
    v_record_id, p_authority_package_id, p_authority_package_fingerprint, p_authority_policy_fingerprint,
    p_consumption_key, null, null, null, 1,
    'register_package', 'transition_permitted', 'package_registered', 0,
    1, p_observed_at, null, p_state_core_fingerprint,
    p_state_fingerprint, p_authority_package_fingerprint, null, p_event_fingerprint,
    false, 'none', false, p_observed_at
  );

  return query select 'transition_permitted', 'package_registered', v_record_id, p_consumption_key, p_authority_package_id, 0::bigint, 1::bigint, null::text, p_state_core_fingerprint, p_state_fingerprint, p_event_fingerprint, false, true, false, false, 'none', false;
exception
  when unique_violation then
    return query select 'transition_rejected', 'storage_operation_rejected', null::uuid, p_consumption_key, p_authority_package_id, null::bigint, null::bigint, null::text, null::text, null::text, null::text, false, false, false, false, 'none', false;
  when others then
    return query select 'transition_rejected', 'storage_operation_rejected', null::uuid, p_consumption_key, p_authority_package_id, null::bigint, null::bigint, null::text, null::text, null::text, null::text, false, false, false, false, 'none', false;
end;
$$;

create function public.terminalize_git_runner_authority_failure(
  p_consumption_key text,
  p_authority_package_fingerprint text,
  p_expected_transition_version bigint,
  p_current_state_fingerprint text,
  p_consumer_fingerprint text,
  p_failure_evidence_fingerprint text,
  p_observed_at timestamptz,
  p_next_state_core_fingerprint text,
  p_next_state_fingerprint text,
  p_event_fingerprint text
) returns table (
  status text, reason text, consumption_record_id uuid, consumption_key text,
  authority_package_id text, previous_transition_version bigint,
  resulting_transition_version bigint, previous_state_fingerprint text,
  state_core_fingerprint text, state_fingerprint text, audit_event_fingerprint text,
  terminal boolean, storage_committed boolean, storage_ambiguous boolean,
  runtime_activated boolean, authority text, toctou_eliminated boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  r public.git_runner_authority_consumption_records%rowtype;
  v_previous_version bigint;
  v_audit_sequence bigint;
begin
  if p_authority_package_fingerprint !~ '^[0-9a-f]{64}$'
    or p_current_state_fingerprint !~ '^[0-9a-f]{64}$'
    or p_consumer_fingerprint !~ '^[0-9a-f]{64}$'
    or p_failure_evidence_fingerprint !~ '^[0-9a-f]{64}$'
    or p_next_state_core_fingerprint !~ '^[0-9a-f]{64}$'
    or p_next_state_fingerprint !~ '^[0-9a-f]{64}$'
    or p_event_fingerprint !~ '^[0-9a-f]{64}$' then
    return query select 'transition_rejected', 'input_contract_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;

  select * into r
  from public.git_runner_authority_consumption_records gr
  where gr.consumption_key = p_consumption_key
    and gr.authority_package_fingerprint = p_authority_package_fingerprint
  for update;

  if not found then
    return query select 'transition_rejected', 'package_linkage_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;
  if r.transition_version <> p_expected_transition_version or r.state_fingerprint <> p_current_state_fingerprint then
    return query select 'transition_rejected', 'stale_transition_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;
  if r.terminal or r.expired or r.revoked or p_observed_at < r.last_transition_at then
    return query select 'transition_rejected', 'failure_terminalization_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;
  if p_observed_at >= r.expires_at then
    return query select 'transition_rejected', 'package_expired', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;
  if r.active_consumer_fingerprint <> p_consumer_fingerprint or r.consumed_stage_count < 1 then
    return query select 'transition_rejected', 'failure_terminalization_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;

  v_previous_version := r.transition_version;
  v_audit_sequence := r.next_audit_sequence;

  update public.git_runner_authority_consumption_records
  set state = 'failed_consumed',
      terminal = true,
      terminal_reason = 'stage_failed_terminal',
      terminal_at = p_observed_at,
      active_consumer_id = null,
      active_consumer_fingerprint = null,
      active_consumer_claimed_at = null,
      aggregate_fingerprint = null,
      transition_version = v_previous_version + 1,
      state_core_fingerprint = p_next_state_core_fingerprint,
      state_fingerprint = p_next_state_fingerprint,
      next_audit_sequence = v_audit_sequence + 1,
      last_audit_event_fingerprint = p_event_fingerprint,
      updated_at = p_observed_at,
      last_transition_at = p_observed_at
  where id = r.id and transition_version = v_previous_version and state_fingerprint = p_current_state_fingerprint;

  insert into public.git_runner_authority_consumption_audit_events (
    consumption_record_id, authority_package_id, authority_package_fingerprint, authority_policy_fingerprint,
    consumption_key, consumer_fingerprint, stage_index, stage_identity, event_sequence,
    operation_identity, event_status, event_reason, transition_version_before, transition_version_after,
    observed_at, previous_state_fingerprint, next_state_core_fingerprint, next_state_fingerprint,
    relevant_evidence_fingerprint, prior_event_fingerprint, event_fingerprint,
    runtime_activated, authority, toctou_eliminated, created_at
  ) values (
    r.id, r.authority_package_id, r.authority_package_fingerprint, r.authority_policy_fingerprint,
    r.consumption_key, p_consumer_fingerprint, null, null, v_audit_sequence,
    'terminalize_failure', 'transition_permitted', 'stage_failed_terminal', v_previous_version, v_previous_version + 1,
    p_observed_at, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint,
    p_failure_evidence_fingerprint, r.last_audit_event_fingerprint, p_event_fingerprint,
    false, 'none', false, p_observed_at
  );

  return query select 'transition_permitted', 'stage_failed_terminal', r.id, r.consumption_key, r.authority_package_id, v_previous_version, v_previous_version + 1, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint, p_event_fingerprint, true, true, false, false, 'none', false;
exception
  when others then
    return query select 'transition_rejected', 'storage_operation_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
end;
$$;

create function public.terminalize_git_runner_authority_ambiguous_failure(
  p_consumption_key text,
  p_authority_package_fingerprint text,
  p_expected_transition_version bigint,
  p_current_state_fingerprint text,
  p_consumer_fingerprint text,
  p_process_request_fingerprint text,
  p_ambiguity_evidence_fingerprint text,
  p_observed_at timestamptz,
  p_next_state_core_fingerprint text,
  p_next_state_fingerprint text,
  p_event_fingerprint text
) returns table (
  status text, reason text, consumption_record_id uuid, consumption_key text,
  authority_package_id text, previous_transition_version bigint,
  resulting_transition_version bigint, previous_state_fingerprint text,
  state_core_fingerprint text, state_fingerprint text, audit_event_fingerprint text,
  terminal boolean, storage_committed boolean, storage_ambiguous boolean,
  runtime_activated boolean, authority text, toctou_eliminated boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  r public.git_runner_authority_consumption_records%rowtype;
  s public.git_runner_authority_consumption_stages%rowtype;
  v_previous_version bigint;
  v_audit_sequence bigint;
begin
  if p_authority_package_fingerprint !~ '^[0-9a-f]{64}$'
    or p_current_state_fingerprint !~ '^[0-9a-f]{64}$'
    or p_consumer_fingerprint !~ '^[0-9a-f]{64}$'
    or p_process_request_fingerprint !~ '^[0-9a-f]{64}$'
    or p_ambiguity_evidence_fingerprint !~ '^[0-9a-f]{64}$'
    or p_next_state_core_fingerprint !~ '^[0-9a-f]{64}$'
    or p_next_state_fingerprint !~ '^[0-9a-f]{64}$'
    or p_event_fingerprint !~ '^[0-9a-f]{64}$' then
    return query select 'transition_rejected', 'input_contract_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;

  select * into r
  from public.git_runner_authority_consumption_records gr
  where gr.consumption_key = p_consumption_key and gr.authority_package_fingerprint = p_authority_package_fingerprint
  for update;
  if not found then
    return query select 'transition_rejected', 'package_linkage_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;
  if r.transition_version <> p_expected_transition_version
    or r.state_fingerprint <> p_current_state_fingerprint
    or r.terminal or r.expired or r.revoked
    or r.active_consumer_fingerprint <> p_consumer_fingerprint then
    return query select 'transition_rejected', 'ambiguous_terminalization_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;
  if p_observed_at >= r.expires_at then
    return query select 'transition_rejected', 'package_expired', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;

  select * into s
  from public.git_runner_authority_consumption_stages gs
  where gs.consumption_record_id = r.id and gs.process_request_fingerprint = p_process_request_fingerprint
  for update;

  if not found or not s.consumed or s.completion_recorded then
    return query select 'transition_rejected', 'ambiguous_terminalization_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;

  v_previous_version := r.transition_version;
  v_audit_sequence := r.next_audit_sequence;

  update public.git_runner_authority_consumption_records
  set state = 'ambiguous_failed_consumed',
      terminal = true,
      terminal_reason = 'ambiguous_failed_terminal',
      terminal_at = p_observed_at,
      active_consumer_id = null,
      active_consumer_fingerprint = null,
      active_consumer_claimed_at = null,
      aggregate_fingerprint = null,
      transition_version = v_previous_version + 1,
      state_core_fingerprint = p_next_state_core_fingerprint,
      state_fingerprint = p_next_state_fingerprint,
      next_audit_sequence = v_audit_sequence + 1,
      last_audit_event_fingerprint = p_event_fingerprint,
      updated_at = p_observed_at,
      last_transition_at = p_observed_at
  where id = r.id and transition_version = v_previous_version and state_fingerprint = p_current_state_fingerprint;

  insert into public.git_runner_authority_consumption_audit_events (
    consumption_record_id, authority_package_id, authority_package_fingerprint, authority_policy_fingerprint,
    consumption_key, consumer_fingerprint, stage_index, stage_identity, event_sequence,
    operation_identity, event_status, event_reason, transition_version_before, transition_version_after,
    observed_at, previous_state_fingerprint, next_state_core_fingerprint, next_state_fingerprint,
    relevant_evidence_fingerprint, prior_event_fingerprint, event_fingerprint,
    runtime_activated, authority, toctou_eliminated, created_at
  ) values (
    r.id, r.authority_package_id, r.authority_package_fingerprint, r.authority_policy_fingerprint,
    r.consumption_key, p_consumer_fingerprint, s.stage_index, s.stage_identity, v_audit_sequence,
    'terminalize_ambiguous_failure', 'transition_permitted', 'ambiguous_failed_terminal', v_previous_version, v_previous_version + 1,
    p_observed_at, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint,
    p_ambiguity_evidence_fingerprint, r.last_audit_event_fingerprint, p_event_fingerprint,
    false, 'none', false, p_observed_at
  );

  return query select 'transition_permitted', 'ambiguous_failed_terminal', r.id, r.consumption_key, r.authority_package_id, v_previous_version, v_previous_version + 1, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint, p_event_fingerprint, true, true, false, false, 'none', false;
exception
  when others then
    return query select 'transition_rejected', 'storage_operation_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
end;
$$;

create function public.terminalize_git_runner_authority_expiry(
  p_consumption_key text,
  p_authority_package_fingerprint text,
  p_expected_transition_version bigint,
  p_current_state_fingerprint text,
  p_observed_at timestamptz,
  p_next_state_core_fingerprint text,
  p_next_state_fingerprint text,
  p_event_fingerprint text
) returns table (
  status text, reason text, consumption_record_id uuid, consumption_key text,
  authority_package_id text, previous_transition_version bigint,
  resulting_transition_version bigint, previous_state_fingerprint text,
  state_core_fingerprint text, state_fingerprint text, audit_event_fingerprint text,
  terminal boolean, storage_committed boolean, storage_ambiguous boolean,
  runtime_activated boolean, authority text, toctou_eliminated boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  r public.git_runner_authority_consumption_records%rowtype;
  v_previous_version bigint;
  v_audit_sequence bigint;
begin
  select * into r
  from public.git_runner_authority_consumption_records gr
  where gr.consumption_key = p_consumption_key and gr.authority_package_fingerprint = p_authority_package_fingerprint
  for update;
  if not found then
    return query select 'transition_rejected', 'package_linkage_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;
  if r.transition_version <> p_expected_transition_version or r.state_fingerprint <> p_current_state_fingerprint then
    return query select 'transition_rejected', 'stale_transition_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;
  if r.terminal or p_observed_at < r.expires_at or p_next_state_core_fingerprint !~ '^[0-9a-f]{64}$' or p_next_state_fingerprint !~ '^[0-9a-f]{64}$' or p_event_fingerprint !~ '^[0-9a-f]{64}$' then
    return query select 'transition_rejected', 'expiry_transition_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;

  v_previous_version := r.transition_version;
  v_audit_sequence := r.next_audit_sequence;
  update public.git_runner_authority_consumption_records
  set state = 'expired',
      terminal = true,
      terminal_reason = 'package_expired_terminal',
      terminal_at = p_observed_at,
      expired = true,
      revoked = false,
      active_consumer_id = null,
      active_consumer_fingerprint = null,
      active_consumer_claimed_at = null,
      aggregate_fingerprint = null,
      transition_version = v_previous_version + 1,
      state_core_fingerprint = p_next_state_core_fingerprint,
      state_fingerprint = p_next_state_fingerprint,
      next_audit_sequence = v_audit_sequence + 1,
      last_audit_event_fingerprint = p_event_fingerprint,
      updated_at = p_observed_at,
      last_transition_at = p_observed_at
  where id = r.id and transition_version = v_previous_version and state_fingerprint = p_current_state_fingerprint;

  insert into public.git_runner_authority_consumption_audit_events (
    consumption_record_id, authority_package_id, authority_package_fingerprint, authority_policy_fingerprint,
    consumption_key, consumer_fingerprint, stage_index, stage_identity, event_sequence,
    operation_identity, event_status, event_reason, transition_version_before, transition_version_after,
    observed_at, previous_state_fingerprint, next_state_core_fingerprint, next_state_fingerprint,
    relevant_evidence_fingerprint, prior_event_fingerprint, event_fingerprint,
    runtime_activated, authority, toctou_eliminated, created_at
  ) values (
    r.id, r.authority_package_id, r.authority_package_fingerprint, r.authority_policy_fingerprint,
    r.consumption_key, null, null, null, v_audit_sequence,
    'terminalize_expiry', 'transition_permitted', 'package_expired_terminal', v_previous_version, v_previous_version + 1,
    p_observed_at, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint,
    r.state_fingerprint, r.last_audit_event_fingerprint, p_event_fingerprint,
    false, 'none', false, p_observed_at
  );

  return query select 'transition_permitted', 'package_expired_terminal', r.id, r.consumption_key, r.authority_package_id, v_previous_version, v_previous_version + 1, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint, p_event_fingerprint, true, true, false, false, 'none', false;
exception
  when others then
    return query select 'transition_rejected', 'storage_operation_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
end;
$$;

create function public.revoke_git_runner_authority_package(
  p_consumption_key text,
  p_authority_package_fingerprint text,
  p_expected_transition_version bigint,
  p_current_state_fingerprint text,
  p_revocation_evidence_fingerprint text,
  p_observed_at timestamptz,
  p_next_state_core_fingerprint text,
  p_next_state_fingerprint text,
  p_event_fingerprint text
) returns table (
  status text, reason text, consumption_record_id uuid, consumption_key text,
  authority_package_id text, previous_transition_version bigint,
  resulting_transition_version bigint, previous_state_fingerprint text,
  state_core_fingerprint text, state_fingerprint text, audit_event_fingerprint text,
  terminal boolean, storage_committed boolean, storage_ambiguous boolean,
  runtime_activated boolean, authority text, toctou_eliminated boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  r public.git_runner_authority_consumption_records%rowtype;
  v_previous_version bigint;
  v_audit_sequence bigint;
begin
  select * into r
  from public.git_runner_authority_consumption_records gr
  where gr.consumption_key = p_consumption_key and gr.authority_package_fingerprint = p_authority_package_fingerprint
  for update;
  if not found then
    return query select 'transition_rejected', 'package_linkage_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;
  if r.transition_version <> p_expected_transition_version
    or r.state_fingerprint <> p_current_state_fingerprint
    or r.terminal
    or p_observed_at < r.last_transition_at
    or p_revocation_evidence_fingerprint !~ '^[0-9a-f]{64}$'
    or p_next_state_core_fingerprint !~ '^[0-9a-f]{64}$'
    or p_next_state_fingerprint !~ '^[0-9a-f]{64}$'
    or p_event_fingerprint !~ '^[0-9a-f]{64}$' then
    return query select 'transition_rejected', 'revocation_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;
  if p_observed_at >= r.expires_at then
    return query select 'transition_rejected', 'package_expired', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;

  v_previous_version := r.transition_version;
  v_audit_sequence := r.next_audit_sequence;
  update public.git_runner_authority_consumption_records
  set state = 'revoked',
      terminal = true,
      terminal_reason = 'package_revoked_terminal',
      terminal_at = p_observed_at,
      expired = false,
      revoked = true,
      active_consumer_id = null,
      active_consumer_fingerprint = null,
      active_consumer_claimed_at = null,
      aggregate_fingerprint = null,
      transition_version = v_previous_version + 1,
      state_core_fingerprint = p_next_state_core_fingerprint,
      state_fingerprint = p_next_state_fingerprint,
      next_audit_sequence = v_audit_sequence + 1,
      last_audit_event_fingerprint = p_event_fingerprint,
      updated_at = p_observed_at,
      last_transition_at = p_observed_at
  where id = r.id and transition_version = v_previous_version and state_fingerprint = p_current_state_fingerprint;

  insert into public.git_runner_authority_consumption_audit_events (
    consumption_record_id, authority_package_id, authority_package_fingerprint, authority_policy_fingerprint,
    consumption_key, consumer_fingerprint, stage_index, stage_identity, event_sequence,
    operation_identity, event_status, event_reason, transition_version_before, transition_version_after,
    observed_at, previous_state_fingerprint, next_state_core_fingerprint, next_state_fingerprint,
    relevant_evidence_fingerprint, prior_event_fingerprint, event_fingerprint,
    runtime_activated, authority, toctou_eliminated, created_at
  ) values (
    r.id, r.authority_package_id, r.authority_package_fingerprint, r.authority_policy_fingerprint,
    r.consumption_key, null, null, null, v_audit_sequence,
    'revoke_package', 'transition_permitted', 'package_revoked_terminal', v_previous_version, v_previous_version + 1,
    p_observed_at, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint,
    p_revocation_evidence_fingerprint, r.last_audit_event_fingerprint, p_event_fingerprint,
    false, 'none', false, p_observed_at
  );

  return query select 'transition_permitted', 'package_revoked_terminal', r.id, r.consumption_key, r.authority_package_id, v_previous_version, v_previous_version + 1, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint, p_event_fingerprint, true, true, false, false, 'none', false;
exception
  when others then
    return query select 'transition_rejected', 'storage_operation_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
end;
$$;

create function public.finalize_git_runner_authority_aggregate(
  p_consumption_key text,
  p_authority_package_fingerprint text,
  p_expected_transition_version bigint,
  p_current_state_fingerprint text,
  p_consumer_fingerprint text,
  p_aggregate_fingerprint text,
  p_observed_at timestamptz,
  p_next_state_core_fingerprint text,
  p_next_state_fingerprint text,
  p_event_fingerprint text
) returns table (
  status text, reason text, consumption_record_id uuid, consumption_key text,
  authority_package_id text, previous_transition_version bigint,
  resulting_transition_version bigint, previous_state_fingerprint text,
  state_core_fingerprint text, state_fingerprint text, audit_event_fingerprint text,
  terminal boolean, storage_committed boolean, storage_ambiguous boolean,
  runtime_activated boolean, authority text, toctou_eliminated boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  r public.git_runner_authority_consumption_records%rowtype;
  v_stage_count integer;
  v_previous_version bigint;
  v_audit_sequence bigint;
begin
  if p_aggregate_fingerprint !~ '^[0-9a-f]{64}$'
    or p_next_state_core_fingerprint !~ '^[0-9a-f]{64}$'
    or p_next_state_fingerprint !~ '^[0-9a-f]{64}$'
    or p_event_fingerprint !~ '^[0-9a-f]{64}$'
    or p_consumer_fingerprint !~ '^[0-9a-f]{64}$' then
    return query select 'transition_rejected', 'input_contract_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;

  select * into r
  from public.git_runner_authority_consumption_records gr
  where gr.consumption_key = p_consumption_key and gr.authority_package_fingerprint = p_authority_package_fingerprint
  for update;
  if not found then
    return query select 'transition_rejected', 'package_linkage_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;

  perform 1
  from public.git_runner_authority_consumption_stages gs
  where gs.consumption_record_id = r.id
  order by gs.stage_index
  for update;

  select count(*) into v_stage_count
  from public.git_runner_authority_consumption_stages gs
  where gs.consumption_record_id = r.id
    and gs.consumed = true
    and gs.completion_recorded = true
    and gs.stage_reason = 'stage_completion_recorded'
    and (
      gs.stage_outcome = 'accepted'
      or (gs.stage_index = 3 and gs.stage_outcome = 'accepted_detached_observation')
    );

  if r.transition_version <> p_expected_transition_version
    or r.state_fingerprint <> p_current_state_fingerprint
    or r.state <> 'partially_consumed'
    or r.terminal
    or r.expired
    or r.revoked
    or r.current_stage_index <> 6
    or r.consumed_stage_count <> 6
    or r.remaining_stage_count <> 0
    or r.active_consumer_fingerprint <> p_consumer_fingerprint
    or p_observed_at >= r.expires_at
    or v_stage_count <> 6 then
    return query select 'transition_rejected', 'aggregate_prerequisite_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;

  v_previous_version := r.transition_version;
  v_audit_sequence := r.next_audit_sequence;
  update public.git_runner_authority_consumption_records
  set state = 'consumed',
      terminal = true,
      terminal_reason = 'sequence_consumed',
      terminal_at = p_observed_at,
      active_consumer_id = null,
      active_consumer_fingerprint = null,
      active_consumer_claimed_at = null,
      aggregate_fingerprint = p_aggregate_fingerprint,
      transition_version = v_previous_version + 1,
      state_core_fingerprint = p_next_state_core_fingerprint,
      state_fingerprint = p_next_state_fingerprint,
      next_audit_sequence = v_audit_sequence + 1,
      last_audit_event_fingerprint = p_event_fingerprint,
      updated_at = p_observed_at,
      last_transition_at = p_observed_at
  where id = r.id and transition_version = v_previous_version and state_fingerprint = p_current_state_fingerprint;

  insert into public.git_runner_authority_consumption_audit_events (
    consumption_record_id, authority_package_id, authority_package_fingerprint, authority_policy_fingerprint,
    consumption_key, consumer_fingerprint, stage_index, stage_identity, event_sequence,
    operation_identity, event_status, event_reason, transition_version_before, transition_version_after,
    observed_at, previous_state_fingerprint, next_state_core_fingerprint, next_state_fingerprint,
    relevant_evidence_fingerprint, prior_event_fingerprint, event_fingerprint,
    runtime_activated, authority, toctou_eliminated, created_at
  ) values (
    r.id, r.authority_package_id, r.authority_package_fingerprint, r.authority_policy_fingerprint,
    r.consumption_key, p_consumer_fingerprint, null, null, v_audit_sequence,
    'finalize_aggregate', 'transition_permitted', 'sequence_consumed', v_previous_version, v_previous_version + 1,
    p_observed_at, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint,
    p_aggregate_fingerprint, r.last_audit_event_fingerprint, p_event_fingerprint,
    false, 'none', false, p_observed_at
  );

  return query select 'transition_permitted', 'sequence_consumed', r.id, r.consumption_key, r.authority_package_id, v_previous_version, v_previous_version + 1, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint, p_event_fingerprint, true, true, false, false, 'none', false;
exception
  when others then
    return query select 'transition_rejected', 'storage_operation_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
end;
$$;

create function public.read_git_runner_authority_consumption_state(
  p_consumption_key text,
  p_authority_package_fingerprint text
) returns table (
  status text,
  reason text,
  consumption_record_id uuid,
  consumption_key text,
  authority_package_id text,
  authority_package_fingerprint text,
  state text,
  current_stage_index smallint,
  consumed_stage_count smallint,
  remaining_stage_count smallint,
  transition_version bigint,
  terminal boolean,
  terminal_reason text,
  expired boolean,
  revoked boolean,
  aggregate_fingerprint text,
  state_core_fingerprint text,
  state_fingerprint text,
  next_audit_sequence bigint,
  last_audit_event_fingerprint text,
  stage_index smallint,
  stage_identity text,
  stage_consumed boolean,
  completion_recorded boolean,
  stage_outcome text,
  stage_reason text,
  stage_record_fingerprint text,
  runtime_activated boolean,
  authority text,
  toctou_eliminated boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  r public.git_runner_authority_consumption_records%rowtype;
begin
  if p_consumption_key is null
    or length(btrim(p_consumption_key)) = 0
    or p_authority_package_fingerprint !~ '^[0-9a-f]{64}$' then
    return query select 'read_rejected', 'input_contract_rejected', null::uuid, null::text, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint, null::bigint, false, null::text, false, false, null::text, null::text, null::text, null::bigint, null::text, null::smallint, null::text, false, false, null::text, null::text, null::text, false, 'none', false;
    return;
  end if;

  select * into r
  from public.git_runner_authority_consumption_records gr
  where gr.consumption_key = p_consumption_key
    and gr.authority_package_fingerprint = p_authority_package_fingerprint;

  if not found then
    return query select 'authority_consumption_state_not_found', 'authority_consumption_state_not_found', null::uuid, null::text, null::text, null::text, null::text, null::smallint, null::smallint, null::smallint, null::bigint, false, null::text, false, false, null::text, null::text, null::text, null::bigint, null::text, null::smallint, null::text, false, false, null::text, null::text, null::text, false, 'none', false;
    return;
  end if;

  return query select
    'authority_consumption_state_found'::text,
    'authority_consumption_state_found'::text,
    r.id,
    r.consumption_key,
    r.authority_package_id,
    r.authority_package_fingerprint,
    r.state,
    r.current_stage_index,
    r.consumed_stage_count,
    r.remaining_stage_count,
    r.transition_version,
    r.terminal,
    r.terminal_reason,
    r.expired,
    r.revoked,
    r.aggregate_fingerprint,
    r.state_core_fingerprint,
    r.state_fingerprint,
    r.next_audit_sequence,
    r.last_audit_event_fingerprint,
    null::smallint,
    null::text,
    false,
    false,
    null::text,
    null::text,
    null::text,
    false,
    'none'::text,
    false;
  return;
exception
  when others then
    return query select 'read_rejected', 'storage_operation_rejected', null::uuid, p_consumption_key, null::text, p_authority_package_fingerprint, null::text, null::smallint, null::smallint, null::smallint, null::bigint, false, null::text, false, false, null::text, null::text, null::text, null::bigint, null::text, null::smallint, null::text, false, false, null::text, null::text, null::text, false, 'none', false;
end;
$$;

create function public.claim_git_runner_authority_consumer(
  p_consumption_key text,
  p_authority_package_fingerprint text,
  p_expected_transition_version bigint,
  p_current_state_fingerprint text,
  p_consumer_id text,
  p_consumer_fingerprint text,
  p_observed_at timestamptz,
  p_next_state_core_fingerprint text,
  p_next_state_fingerprint text,
  p_event_fingerprint text
) returns table (
  status text,
  reason text,
  consumption_record_id uuid,
  consumption_key text,
  authority_package_id text,
  previous_transition_version bigint,
  resulting_transition_version bigint,
  previous_state_fingerprint text,
  state_core_fingerprint text,
  state_fingerprint text,
  audit_event_fingerprint text,
  terminal boolean,
  storage_committed boolean,
  storage_ambiguous boolean,
  runtime_activated boolean,
  authority text,
  toctou_eliminated boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  r public.git_runner_authority_consumption_records%rowtype;
  v_previous_version bigint;
  v_audit_sequence bigint;
begin
  if p_authority_package_fingerprint !~ '^[0-9a-f]{64}$'
    or p_current_state_fingerprint !~ '^[0-9a-f]{64}$'
    or p_consumer_fingerprint !~ '^[0-9a-f]{64}$'
    or p_next_state_core_fingerprint !~ '^[0-9a-f]{64}$'
    or p_next_state_fingerprint !~ '^[0-9a-f]{64}$'
    or p_event_fingerprint !~ '^[0-9a-f]{64}$'
    or p_consumer_id is null
    or length(btrim(p_consumer_id)) = 0 then
    return query select 'transition_rejected', 'input_contract_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;

  select * into r
  from public.git_runner_authority_consumption_records gr
  where gr.consumption_key = p_consumption_key
    and gr.authority_package_fingerprint = p_authority_package_fingerprint
  for update;

  if not found then
    return query select 'transition_rejected', 'package_linkage_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;

  if r.transition_version <> p_expected_transition_version or r.state_fingerprint <> p_current_state_fingerprint then
    return query select 'transition_rejected', 'stale_transition_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;
  if r.state <> 'issued' or r.active_consumer_id is not null or r.terminal or r.expired or r.revoked or r.current_stage_index <> 0 or r.consumed_stage_count <> 0 or r.remaining_stage_count <> 6 or p_observed_at >= r.expires_at then
    return query select 'transition_rejected', 'package_not_claimable', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;

  v_previous_version := r.transition_version;
  v_audit_sequence := r.next_audit_sequence;

  update public.git_runner_authority_consumption_records
  set state = 'active',
      active_consumer_id = p_consumer_id,
      active_consumer_fingerprint = p_consumer_fingerprint,
      active_consumer_claimed_at = p_observed_at,
      transition_version = v_previous_version + 1,
      state_core_fingerprint = p_next_state_core_fingerprint,
      state_fingerprint = p_next_state_fingerprint,
      next_audit_sequence = v_audit_sequence + 1,
      last_audit_event_fingerprint = p_event_fingerprint,
      updated_at = p_observed_at,
      last_transition_at = p_observed_at
  where id = r.id
    and transition_version = v_previous_version
    and state_fingerprint = p_current_state_fingerprint;

  if not found then
    return query select 'transition_rejected', 'stale_transition_rejected', r.id, r.consumption_key, r.authority_package_id, v_previous_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;

  insert into public.git_runner_authority_consumption_audit_events (
    consumption_record_id, authority_package_id, authority_package_fingerprint, authority_policy_fingerprint,
    consumption_key, consumer_fingerprint, stage_index, stage_identity, event_sequence,
    operation_identity, event_status, event_reason, transition_version_before, transition_version_after,
    observed_at, previous_state_fingerprint, next_state_core_fingerprint, next_state_fingerprint,
    relevant_evidence_fingerprint, prior_event_fingerprint, event_fingerprint,
    runtime_activated, authority, toctou_eliminated, created_at
  ) values (
    r.id, r.authority_package_id, r.authority_package_fingerprint, r.authority_policy_fingerprint,
    r.consumption_key, p_consumer_fingerprint, null, null, v_audit_sequence,
    'claim_consumer', 'transition_permitted', 'consumer_claimed', v_previous_version, v_previous_version + 1,
    p_observed_at, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint,
    p_consumer_fingerprint, r.last_audit_event_fingerprint, p_event_fingerprint,
    false, 'none', false, p_observed_at
  );

  return query select 'transition_permitted', 'consumer_claimed', r.id, r.consumption_key, r.authority_package_id, v_previous_version, v_previous_version + 1, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint, p_event_fingerprint, false, true, false, false, 'none', false;
exception
  when others then
    return query select 'transition_rejected', 'storage_operation_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
end;
$$;

create function public.consume_git_runner_authority_stage(
  p_consumption_key text,
  p_authority_package_fingerprint text,
  p_expected_transition_version bigint,
  p_current_state_fingerprint text,
  p_consumer_fingerprint text,
  p_stage_index smallint,
  p_stage_identity text,
  p_stage_grant_fingerprint text,
  p_stage_consumption_fingerprint text,
  p_process_request_fingerprint text,
  p_observed_at timestamptz,
  p_next_state_core_fingerprint text,
  p_next_state_fingerprint text,
  p_stage_record_fingerprint text,
  p_event_fingerprint text
) returns table (
  status text,
  reason text,
  consumption_record_id uuid,
  consumption_key text,
  authority_package_id text,
  previous_transition_version bigint,
  resulting_transition_version bigint,
  previous_state_fingerprint text,
  state_core_fingerprint text,
  state_fingerprint text,
  audit_event_fingerprint text,
  terminal boolean,
  storage_committed boolean,
  storage_ambiguous boolean,
  runtime_activated boolean,
  authority text,
  toctou_eliminated boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  r public.git_runner_authority_consumption_records%rowtype;
  s public.git_runner_authority_consumption_stages%rowtype;
  prior_stage public.git_runner_authority_consumption_stages%rowtype;
  v_previous_version bigint;
  v_audit_sequence bigint;
begin
  if p_authority_package_fingerprint !~ '^[0-9a-f]{64}$'
    or p_current_state_fingerprint !~ '^[0-9a-f]{64}$'
    or p_consumer_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_grant_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_consumption_fingerprint !~ '^[0-9a-f]{64}$'
    or p_process_request_fingerprint !~ '^[0-9a-f]{64}$'
    or p_next_state_core_fingerprint !~ '^[0-9a-f]{64}$'
    or p_next_state_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_record_fingerprint !~ '^[0-9a-f]{64}$'
    or p_event_fingerprint !~ '^[0-9a-f]{64}$'
    or not (
      (p_stage_index = 0 and p_stage_identity = 'git_repository_root_v1')
      or (p_stage_index = 1 and p_stage_identity = 'git_object_format_v1')
      or (p_stage_index = 2 and p_stage_identity = 'git_head_before_v1')
      or (p_stage_index = 3 and p_stage_identity = 'git_branch_state_v1')
      or (p_stage_index = 4 and p_stage_identity = 'git_porcelain_status_v1')
      or (p_stage_index = 5 and p_stage_identity = 'git_head_after_v1')
    ) then
    return query select 'transition_rejected', 'input_contract_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;

  select * into r
  from public.git_runner_authority_consumption_records gr
  where gr.consumption_key = p_consumption_key
    and gr.authority_package_fingerprint = p_authority_package_fingerprint
  for update;

  if not found then
    return query select 'transition_rejected', 'package_linkage_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;
  if r.transition_version <> p_expected_transition_version or r.state_fingerprint <> p_current_state_fingerprint then
    return query select 'transition_rejected', 'stale_transition_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;
  if r.state not in ('active', 'partially_consumed') or r.terminal or r.expired or r.revoked or r.active_consumer_fingerprint <> p_consumer_fingerprint or p_observed_at >= r.expires_at then
    return query select 'transition_rejected', 'state_transition_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;
  if r.current_stage_index <> p_stage_index then
    return query select 'transition_rejected', 'stage_order_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;

  select * into s
  from public.git_runner_authority_consumption_stages gs
  where gs.consumption_record_id = r.id
    and gs.stage_index = p_stage_index
    and gs.stage_identity = p_stage_identity
    and gs.stage_grant_fingerprint = p_stage_grant_fingerprint
  for update;

  if not found then
    return query select 'transition_rejected', 'stage_prerequisite_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;
  if s.consumed or s.completion_recorded then
    return query select 'transition_rejected', 'stage_already_consumed', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;

  if p_stage_index > 0 then
    select * into prior_stage
    from public.git_runner_authority_consumption_stages gs
    where gs.consumption_record_id = r.id
      and gs.stage_index = p_stage_index - 1
    for update;
    if not found
      or prior_stage.completion_recorded is distinct from true
      or prior_stage.stage_reason <> 'stage_completion_recorded'
      or prior_stage.stage_outcome not in ('accepted', 'accepted_detached_observation') then
      return query select 'transition_rejected', 'stage_prerequisite_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
      return;
    end if;
  end if;

  v_previous_version := r.transition_version;
  v_audit_sequence := r.next_audit_sequence;

  update public.git_runner_authority_consumption_stages
  set consumed = true,
      consumed_at = p_observed_at,
      consumed_by_fingerprint = p_consumer_fingerprint,
      stage_consumption_fingerprint = p_stage_consumption_fingerprint,
      process_request_fingerprint = p_process_request_fingerprint,
      stage_transition_version = stage_transition_version + 1,
      stage_record_fingerprint = p_stage_record_fingerprint,
      updated_at = p_observed_at
  where id = s.id
    and consumed = false
    and completion_recorded = false;

  update public.git_runner_authority_consumption_records
  set state = 'partially_consumed',
      consumed_stage_count = r.consumed_stage_count + 1,
      remaining_stage_count = r.remaining_stage_count - 1,
      transition_version = v_previous_version + 1,
      state_core_fingerprint = p_next_state_core_fingerprint,
      state_fingerprint = p_next_state_fingerprint,
      next_audit_sequence = v_audit_sequence + 1,
      last_audit_event_fingerprint = p_event_fingerprint,
      updated_at = p_observed_at,
      last_transition_at = p_observed_at
  where id = r.id
    and transition_version = v_previous_version
    and state_fingerprint = p_current_state_fingerprint;

  insert into public.git_runner_authority_consumption_audit_events (
    consumption_record_id, authority_package_id, authority_package_fingerprint, authority_policy_fingerprint,
    consumption_key, consumer_fingerprint, stage_index, stage_identity, event_sequence,
    operation_identity, event_status, event_reason, transition_version_before, transition_version_after,
    observed_at, previous_state_fingerprint, next_state_core_fingerprint, next_state_fingerprint,
    relevant_evidence_fingerprint, prior_event_fingerprint, event_fingerprint,
    runtime_activated, authority, toctou_eliminated, created_at
  ) values (
    r.id, r.authority_package_id, r.authority_package_fingerprint, r.authority_policy_fingerprint,
    r.consumption_key, p_consumer_fingerprint, p_stage_index, p_stage_identity, v_audit_sequence,
    'consume_stage', 'transition_permitted', 'stage_authority_consumed', v_previous_version, v_previous_version + 1,
    p_observed_at, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint,
    p_stage_consumption_fingerprint, r.last_audit_event_fingerprint, p_event_fingerprint,
    false, 'none', false, p_observed_at
  );

  return query select 'transition_permitted', 'stage_authority_consumed', r.id, r.consumption_key, r.authority_package_id, v_previous_version, v_previous_version + 1, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint, p_event_fingerprint, false, true, false, false, 'none', false;
exception
  when unique_violation then
    return query select 'transition_rejected', 'storage_integrity_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
  when others then
    return query select 'transition_rejected', 'storage_operation_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
end;
$$;

create function public.record_git_runner_authority_stage_completion(
  p_consumption_key text,
  p_authority_package_fingerprint text,
  p_expected_transition_version bigint,
  p_current_state_fingerprint text,
  p_consumer_fingerprint text,
  p_stage_index smallint,
  p_process_request_fingerprint text,
  p_completion_fingerprint text,
  p_interpretation_fingerprint text,
  p_stage_outcome text,
  p_completed_at timestamptz,
  p_next_state_core_fingerprint text,
  p_next_state_fingerprint text,
  p_stage_record_fingerprint text,
  p_event_fingerprint text
) returns table (
  status text,
  reason text,
  consumption_record_id uuid,
  consumption_key text,
  authority_package_id text,
  previous_transition_version bigint,
  resulting_transition_version bigint,
  previous_state_fingerprint text,
  state_core_fingerprint text,
  state_fingerprint text,
  audit_event_fingerprint text,
  terminal boolean,
  storage_committed boolean,
  storage_ambiguous boolean,
  runtime_activated boolean,
  authority text,
  toctou_eliminated boolean
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  r public.git_runner_authority_consumption_records%rowtype;
  s public.git_runner_authority_consumption_stages%rowtype;
  v_previous_version bigint;
  v_audit_sequence bigint;
  v_next_stage smallint;
  v_next_state text;
  v_terminal boolean;
  v_terminal_reason text;
  v_event_reason text;
begin
  if p_authority_package_fingerprint !~ '^[0-9a-f]{64}$'
    or p_current_state_fingerprint !~ '^[0-9a-f]{64}$'
    or p_consumer_fingerprint !~ '^[0-9a-f]{64}$'
    or p_process_request_fingerprint !~ '^[0-9a-f]{64}$'
    or p_completion_fingerprint !~ '^[0-9a-f]{64}$'
    or (p_interpretation_fingerprint is not null and p_interpretation_fingerprint !~ '^[0-9a-f]{64}$')
    or p_next_state_core_fingerprint !~ '^[0-9a-f]{64}$'
    or p_next_state_fingerprint !~ '^[0-9a-f]{64}$'
    or p_stage_record_fingerprint !~ '^[0-9a-f]{64}$'
    or p_event_fingerprint !~ '^[0-9a-f]{64}$'
    or not (
      (p_stage_outcome = 'accepted' and p_interpretation_fingerprint is not null)
      or (p_stage_outcome = 'accepted_detached_observation' and p_stage_index = 3 and p_interpretation_fingerprint is not null)
      or (p_stage_outcome in ('rejected', 'process_failed') and p_interpretation_fingerprint is null)
      or (p_stage_outcome = 'ambiguous_process_state' and p_interpretation_fingerprint is null)
    ) then
    return query select 'transition_rejected', 'input_contract_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;

  select * into r
  from public.git_runner_authority_consumption_records gr
  where gr.consumption_key = p_consumption_key
    and gr.authority_package_fingerprint = p_authority_package_fingerprint
  for update;

  if not found then
    return query select 'transition_rejected', 'package_linkage_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
    return;
  end if;
  if r.transition_version <> p_expected_transition_version or r.state_fingerprint <> p_current_state_fingerprint then
    return query select 'transition_rejected', 'stale_transition_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;
  if r.state <> 'partially_consumed' or r.terminal or r.expired or r.revoked then
    return query select 'transition_rejected', 'state_transition_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;
  if p_completed_at >= r.expires_at then
    return query select 'transition_rejected', 'package_expired', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;
  if r.active_consumer_fingerprint <> p_consumer_fingerprint then
    return query select 'transition_rejected', 'state_transition_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;

  select * into s
  from public.git_runner_authority_consumption_stages gs
  where gs.consumption_record_id = r.id
    and gs.stage_index = p_stage_index
    and gs.process_request_fingerprint = p_process_request_fingerprint
  for update;

  if not found or not s.consumed or s.completion_recorded then
    return query select 'transition_rejected', 'stage_prerequisite_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;
  if p_completed_at < s.consumed_at then
    return query select 'transition_rejected', 'timestamp_rejected', r.id, r.consumption_key, r.authority_package_id, r.transition_version, null::bigint, r.state_fingerprint, null::text, null::text, null::text, r.terminal, false, false, false, 'none', false;
    return;
  end if;

  v_previous_version := r.transition_version;
  v_audit_sequence := r.next_audit_sequence;
  v_next_stage := case when p_stage_outcome in ('accepted', 'accepted_detached_observation') then p_stage_index + 1 else p_stage_index end;
  v_terminal := p_stage_outcome in ('rejected', 'process_failed', 'ambiguous_process_state');
  v_terminal_reason := case
    when p_stage_outcome = 'ambiguous_process_state' then 'ambiguous_failed_terminal'
    when p_stage_outcome in ('rejected', 'process_failed') then 'stage_failed_terminal'
    else null
  end;
  v_next_state := case
    when p_stage_outcome = 'ambiguous_process_state' then 'ambiguous_failed_consumed'
    when p_stage_outcome in ('rejected', 'process_failed') then 'failed_consumed'
    else 'partially_consumed'
  end;
  v_event_reason := coalesce(v_terminal_reason, 'stage_completion_recorded');

  update public.git_runner_authority_consumption_stages
  set completion_recorded = true,
      completion_fingerprint = p_completion_fingerprint,
      interpretation_fingerprint = p_interpretation_fingerprint,
      stage_outcome = p_stage_outcome,
      stage_reason = v_event_reason,
      completed_at = p_completed_at,
      stage_transition_version = stage_transition_version + 1,
      stage_record_fingerprint = p_stage_record_fingerprint,
      updated_at = p_completed_at
  where id = s.id
    and completion_recorded = false;

  update public.git_runner_authority_consumption_records
  set state = v_next_state,
      current_stage_index = v_next_stage,
      terminal = v_terminal,
      terminal_reason = v_terminal_reason,
      terminal_at = case when v_terminal then p_completed_at else null end,
      active_consumer_id = case when v_terminal then null else active_consumer_id end,
      active_consumer_fingerprint = case when v_terminal then null else active_consumer_fingerprint end,
      active_consumer_claimed_at = case when v_terminal then null else active_consumer_claimed_at end,
      transition_version = v_previous_version + 1,
      state_core_fingerprint = p_next_state_core_fingerprint,
      state_fingerprint = p_next_state_fingerprint,
      next_audit_sequence = v_audit_sequence + 1,
      last_audit_event_fingerprint = p_event_fingerprint,
      updated_at = p_completed_at,
      last_transition_at = p_completed_at
  where id = r.id
    and transition_version = v_previous_version
    and state_fingerprint = p_current_state_fingerprint;

  insert into public.git_runner_authority_consumption_audit_events (
    consumption_record_id, authority_package_id, authority_package_fingerprint, authority_policy_fingerprint,
    consumption_key, consumer_fingerprint, stage_index, stage_identity, event_sequence,
    operation_identity, event_status, event_reason, transition_version_before, transition_version_after,
    observed_at, previous_state_fingerprint, next_state_core_fingerprint, next_state_fingerprint,
    relevant_evidence_fingerprint, prior_event_fingerprint, event_fingerprint,
    runtime_activated, authority, toctou_eliminated, created_at
  ) values (
    r.id, r.authority_package_id, r.authority_package_fingerprint, r.authority_policy_fingerprint,
    r.consumption_key, p_consumer_fingerprint, p_stage_index, s.stage_identity, v_audit_sequence,
    'record_stage_completion', 'transition_permitted', v_event_reason, v_previous_version, v_previous_version + 1,
    p_completed_at, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint,
    p_completion_fingerprint, r.last_audit_event_fingerprint, p_event_fingerprint,
    false, 'none', false, p_completed_at
  );

  return query select 'transition_permitted', v_event_reason, r.id, r.consumption_key, r.authority_package_id, v_previous_version, v_previous_version + 1, r.state_fingerprint, p_next_state_core_fingerprint, p_next_state_fingerprint, p_event_fingerprint, v_terminal, true, false, false, 'none', false;
exception
  when others then
    return query select 'transition_rejected', 'storage_operation_rejected', null::uuid, p_consumption_key, null::text, null::bigint, null::bigint, p_current_state_fingerprint, null::text, null::text, null::text, false, false, false, false, 'none', false;
end;
$$;

revoke execute on function public.register_git_runner_authority_package(text, text, text, text, text, integer, text, integer, text, integer, text, integer, text, integer, text, text, text, text, text, text, text, text, text, text, text, integer, timestamptz, timestamptz, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, timestamptz, text) from public, anon, authenticated;
revoke execute on function public.claim_git_runner_authority_consumer(text, text, bigint, text, text, text, timestamptz, text, text, text) from public, anon, authenticated;
revoke execute on function public.consume_git_runner_authority_stage(text, text, bigint, text, text, smallint, text, text, text, text, timestamptz, text, text, text, text) from public, anon, authenticated;
revoke execute on function public.record_git_runner_authority_stage_completion(text, text, bigint, text, text, smallint, text, text, text, text, timestamptz, text, text, text, text) from public, anon, authenticated;
revoke execute on function public.terminalize_git_runner_authority_failure(text, text, bigint, text, text, text, timestamptz, text, text, text) from public, anon, authenticated;
revoke execute on function public.terminalize_git_runner_authority_ambiguous_failure(text, text, bigint, text, text, text, text, timestamptz, text, text, text) from public, anon, authenticated;
revoke execute on function public.terminalize_git_runner_authority_expiry(text, text, bigint, text, timestamptz, text, text, text) from public, anon, authenticated;
revoke execute on function public.revoke_git_runner_authority_package(text, text, bigint, text, text, timestamptz, text, text, text) from public, anon, authenticated;
revoke execute on function public.finalize_git_runner_authority_aggregate(text, text, bigint, text, text, text, timestamptz, text, text, text) from public, anon, authenticated;
revoke execute on function public.read_git_runner_authority_consumption_state(text, text) from public, anon, authenticated;

comment on function public.register_git_runner_authority_package(text, text, text, text, text, integer, text, integer, text, integer, text, integer, text, integer, text, text, text, text, text, text, text, text, text, text, text, integer, timestamptz, timestamptz, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, timestamptz, text) is
  'Dormant Action 626 RPC primitive. Atomically registers one Git runner authority package, six fixed stages, and one audit event. No application caller exists; no Git execution, process/repository access, runtime readiness, authority consumption, or deployment approval is implied.';
comment on function public.claim_git_runner_authority_consumer(text, text, bigint, text, text, text, timestamptz, text, text, text) is
  'Dormant Action 626 RPC primitive. Claims one package consumer with row lock and CAS. No application caller exists and no Git/process/repository/runtime authority is activated.';
comment on function public.consume_git_runner_authority_stage(text, text, bigint, text, text, smallint, text, text, text, text, timestamptz, text, text, text, text) is
  'Dormant Action 626 RPC primitive. Durably marks one fixed Git observation stage consumed before any future process request. It creates no process and grants no runtime execution.';
comment on function public.record_git_runner_authority_stage_completion(text, text, bigint, text, text, smallint, text, text, text, text, timestamptz, text, text, text, text) is
  'Dormant Action 626 RPC primitive. Records one fixed stage completion and terminalizes only closed failure or ambiguity branches. It observes no process and executes no Git command.';
comment on function public.terminalize_git_runner_authority_failure(text, text, bigint, text, text, text, timestamptz, text, text, text) is
  'Dormant Action 626 RPC primitive. Terminalizes a narrowly approved failed consumed package state. It does not retry, reset, reissue, execute Git, or activate runtime authority.';
comment on function public.terminalize_git_runner_authority_ambiguous_failure(text, text, bigint, text, text, text, text, timestamptz, text, text, text) is
  'Dormant Action 626 RPC primitive. Terminalizes a consumed stage with ambiguous process evidence. It performs no reconciliation, retry, Git execution, process observation, or runner activation.';
comment on function public.terminalize_git_runner_authority_expiry(text, text, bigint, text, timestamptz, text, text, text) is
  'Dormant Action 626 RPC primitive. Terminalizes an expired package after exact CAS and observed time checks. It grants no runtime readiness or replay safety by itself.';
comment on function public.revoke_git_runner_authority_package(text, text, bigint, text, text, timestamptz, text, text, text) is
  'Dormant Action 626 RPC primitive. Revokes one nonterminal package with exact CAS. It grants no un-revoke, runtime caller, Git execution, process/repository access, or deployment approval.';
comment on function public.finalize_git_runner_authority_aggregate(text, text, bigint, text, text, text, timestamptz, text, text, text) is
  'Dormant Action 626 RPC primitive. Finalizes only a six-stage accepted aggregate under row locks and CAS. It does not make the system runtime-ready, staging-ready, or production-ready.';
comment on function public.read_git_runner_authority_consumption_state(text, text) is
  'Dormant Action 626 read RPC primitive. Returns bounded state and stage fingerprints only. No unrestricted audit history, raw path, Git output, process data, credential, environment, or authority is exposed.';
