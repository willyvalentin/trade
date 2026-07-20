-- Action 622: Git runner authority consumption storage schema.
--
-- This migration creates durable storage primitives only. It creates no RPC,
-- SECURITY DEFINER function, runtime caller, runner, Git execution path,
-- process observation path, repository inspection path, or live authority
-- consumption behavior.

create table public.git_runner_authority_consumption_records (
  id uuid primary key default gen_random_uuid(),
  consumption_key text not null,
  authority_package_id text not null,
  authority_package_fingerprint text not null,
  authority_policy_fingerprint text not null,
  schema_identity text not null,
  schema_version integer not null,
  package_contract_identity text not null,
  package_contract_version integer not null,
  capability_set_identity text not null,
  capability_set_version integer not null,
  expiry_policy_identity text not null,
  expiry_policy_version integer not null,
  freshness_policy_identity text not null,
  freshness_policy_version integer not null,
  session_fingerprint text not null,
  sequence_identity text not null,
  sequence_fingerprint text not null,
  executable_identity text not null,
  executable_fingerprint text not null,
  resolution_fingerprint text not null,
  revalidation_fingerprint text not null,
  worktree_fingerprint text not null,
  compatibility_result_fingerprint text not null,
  platform text not null,
  source_policy_identity text not null,
  source_policy_version integer not null,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  state text not null,
  current_stage_index smallint not null,
  consumed_stage_count smallint not null,
  remaining_stage_count smallint not null,
  transition_version bigint not null,
  active_consumer_id text null,
  active_consumer_fingerprint text null,
  active_consumer_claimed_at timestamptz null,
  terminal boolean not null,
  terminal_reason text null,
  terminal_at timestamptz null,
  expired boolean not null,
  revoked boolean not null,
  retry_count smallint not null default 0,
  fallback_attempted boolean not null default false,
  aggregate_fingerprint text null,
  state_core_fingerprint text not null,
  state_fingerprint text not null,
  next_audit_sequence bigint not null,
  last_audit_event_fingerprint text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_transition_at timestamptz not null,
  constraint git_runner_authority_consumption_records_consumption_key_key
    unique (consumption_key),
  constraint git_runner_authority_consumption_records_package_id_key
    unique (authority_package_id),
  constraint git_runner_authority_consumption_records_package_fingerprint_key
    unique (authority_package_fingerprint),
  constraint git_runner_authority_consumption_records_package_pair_key
    unique (authority_package_id, authority_package_fingerprint),
  constraint git_runner_authority_consumption_records_identity_text_check
    check (
      length(btrim(consumption_key)) > 0
      and length(btrim(authority_package_id)) > 0
      and executable_identity = '/usr/bin/git'
    ),
  constraint git_runner_authority_consumption_records_sha256_check
    check (
      authority_package_fingerprint ~ '^[0-9a-f]{64}$'
      and authority_policy_fingerprint ~ '^[0-9a-f]{64}$'
      and session_fingerprint ~ '^[0-9a-f]{64}$'
      and sequence_fingerprint ~ '^[0-9a-f]{64}$'
      and executable_fingerprint ~ '^[0-9a-f]{64}$'
      and resolution_fingerprint ~ '^[0-9a-f]{64}$'
      and revalidation_fingerprint ~ '^[0-9a-f]{64}$'
      and worktree_fingerprint ~ '^[0-9a-f]{64}$'
      and compatibility_result_fingerprint ~ '^[0-9a-f]{64}$'
      and state_core_fingerprint ~ '^[0-9a-f]{64}$'
      and state_fingerprint ~ '^[0-9a-f]{64}$'
      and (active_consumer_fingerprint is null or active_consumer_fingerprint ~ '^[0-9a-f]{64}$')
      and (aggregate_fingerprint is null or aggregate_fingerprint ~ '^[0-9a-f]{64}$')
      and (last_audit_event_fingerprint is null or last_audit_event_fingerprint ~ '^[0-9a-f]{64}$')
    ),
  constraint git_runner_authority_consumption_records_exact_identity_check
    check (
      schema_identity = 'ture.execution.dormant-git-runner-authority-consumption-storage.schema-family.v1'
      and schema_version = 1
      and package_contract_identity = 'ture.execution.pure-dormant-git-runner-authority-package-contract.fixture.v1'
      and package_contract_version = 1
      and capability_set_identity = 'ture.execution.read-only-git-repository-observation-capability-set.v1'
      and capability_set_version = 1
      and expiry_policy_identity = 'ture.execution.dormant-git-runner-authority-expiry-policy.v1'
      and expiry_policy_version = 1
      and freshness_policy_identity = 'ture.execution.dormant-git-runner-authority-freshness-policy.v1'
      and freshness_policy_version = 1
      and sequence_identity = 'ture.execution.read-only-git-repository-observation.sequence.root-object-format-head-branch-status-head.v1'
      and platform = 'macos'
      and source_policy_identity = 'pure_raw_process_completion_evidence_contract_policy_v1'
      and source_policy_version = 1
    ),
  constraint git_runner_authority_consumption_records_state_check
    check (
      state in (
        'issued',
        'active',
        'partially_consumed',
        'consumed',
        'failed_consumed',
        'ambiguous_failed_consumed',
        'expired',
        'revoked'
      )
    ),
  constraint git_runner_authority_consumption_records_terminal_reason_check
    check (
      terminal_reason is null
      or terminal_reason in (
        'stage_failed_terminal',
        'ambiguous_failed_terminal',
        'package_expired_terminal',
        'package_revoked_terminal',
        'sequence_consumed'
      )
    ),
  constraint git_runner_authority_consumption_records_count_check
    check (
      current_stage_index between 0 and 6
      and consumed_stage_count between 0 and 6
      and remaining_stage_count between 0 and 6
      and consumed_stage_count + remaining_stage_count = 6
    ),
  constraint git_runner_authority_consumption_records_transition_check
    check (
      transition_version >= 1
      and next_audit_sequence >= 1
      and retry_count = 0
      and fallback_attempted = false
    ),
  constraint git_runner_authority_consumption_records_expiry_check
    check (expires_at = issued_at + interval '30 seconds'),
  constraint git_runner_authority_consumption_records_consumer_group_check
    check (
      (
        active_consumer_id is null
        and active_consumer_fingerprint is null
        and active_consumer_claimed_at is null
      )
      or (
        active_consumer_id is not null
        and length(btrim(active_consumer_id)) > 0
        and active_consumer_fingerprint is not null
        and active_consumer_claimed_at is not null
      )
    ),
  constraint git_runner_authority_consumption_records_terminal_group_check
    check (
      (
        terminal = false
        and terminal_reason is null
        and terminal_at is null
        and state in ('issued', 'active', 'partially_consumed')
      )
      or (
        terminal = true
        and terminal_reason is not null
        and terminal_at is not null
        and state in ('consumed', 'failed_consumed', 'ambiguous_failed_consumed', 'expired', 'revoked')
      )
    ),
  constraint git_runner_authority_consumption_records_state_flag_check
    check (
      expired = (state = 'expired')
      and revoked = (state = 'revoked')
      and not (expired and revoked)
    ),
  constraint git_runner_authority_consumption_records_aggregate_check
    check (
      (state = 'consumed' and aggregate_fingerprint is not null)
      or (state <> 'consumed' and aggregate_fingerprint is null)
    ),
  constraint git_runner_authority_consumption_records_state_progress_check
    check (
      case state
        when 'issued' then
          current_stage_index = 0
          and consumed_stage_count = 0
          and remaining_stage_count = 6
          and transition_version = 1
          and next_audit_sequence = 1
          and terminal = false
          and terminal_reason is null
          and terminal_at is null
          and expired = false
          and revoked = false
          and active_consumer_id is null
          and active_consumer_fingerprint is null
          and active_consumer_claimed_at is null
          and aggregate_fingerprint is null
        when 'active' then
          current_stage_index = 0
          and consumed_stage_count = 0
          and remaining_stage_count = 6
          and terminal = false
          and terminal_reason is null
          and terminal_at is null
          and expired = false
          and revoked = false
          and active_consumer_id is not null
          and active_consumer_fingerprint is not null
          and active_consumer_claimed_at is not null
          and aggregate_fingerprint is null
        when 'partially_consumed' then
          current_stage_index between 0 and 6
          and consumed_stage_count between 1 and 6
          and remaining_stage_count = 6 - consumed_stage_count
          and terminal = false
          and terminal_reason is null
          and terminal_at is null
          and expired = false
          and revoked = false
          and active_consumer_id is not null
          and active_consumer_fingerprint is not null
          and active_consumer_claimed_at is not null
          and aggregate_fingerprint is null
        when 'consumed' then
          current_stage_index = 6
          and consumed_stage_count = 6
          and remaining_stage_count = 0
          and terminal = true
          and terminal_reason = 'sequence_consumed'
          and terminal_at is not null
          and expired = false
          and revoked = false
          and active_consumer_id is null
          and active_consumer_fingerprint is null
          and active_consumer_claimed_at is null
          and aggregate_fingerprint is not null
        when 'failed_consumed' then
          current_stage_index between 0 and 5
          and consumed_stage_count between 1 and 6
          and remaining_stage_count = 6 - consumed_stage_count
          and terminal = true
          and terminal_reason = 'stage_failed_terminal'
          and terminal_at is not null
          and expired = false
          and revoked = false
          and active_consumer_id is null
          and active_consumer_fingerprint is null
          and active_consumer_claimed_at is null
          and aggregate_fingerprint is null
        when 'ambiguous_failed_consumed' then
          current_stage_index between 0 and 5
          and consumed_stage_count between 1 and 6
          and remaining_stage_count = 6 - consumed_stage_count
          and terminal = true
          and terminal_reason = 'ambiguous_failed_terminal'
          and terminal_at is not null
          and expired = false
          and revoked = false
          and active_consumer_id is null
          and active_consumer_fingerprint is null
          and active_consumer_claimed_at is null
          and aggregate_fingerprint is null
        when 'expired' then
          current_stage_index between 0 and 6
          and terminal = true
          and terminal_reason = 'package_expired_terminal'
          and terminal_at is not null
          and expired = true
          and revoked = false
          and active_consumer_id is null
          and active_consumer_fingerprint is null
          and active_consumer_claimed_at is null
          and aggregate_fingerprint is null
        when 'revoked' then
          current_stage_index between 0 and 6
          and terminal = true
          and terminal_reason = 'package_revoked_terminal'
          and terminal_at is not null
          and expired = false
          and revoked = true
          and active_consumer_id is null
          and active_consumer_fingerprint is null
          and active_consumer_claimed_at is null
          and aggregate_fingerprint is null
        else false
      end
    ),
  constraint git_runner_authority_consumption_records_timestamp_order_check
    check (
      expires_at > issued_at
      and created_at <= updated_at
      and issued_at <= expires_at
      and last_transition_at >= issued_at
      and (active_consumer_claimed_at is null or active_consumer_claimed_at >= issued_at)
      and (terminal_at is null or terminal_at >= issued_at)
    )
);

create table public.git_runner_authority_consumption_stages (
  id uuid primary key default gen_random_uuid(),
  consumption_record_id uuid not null
    references public.git_runner_authority_consumption_records(id) on delete restrict,
  stage_index smallint not null,
  stage_identity text not null,
  authority_policy_fingerprint text not null,
  stage_grant_fingerprint text not null,
  stage_authority_fingerprint text not null,
  consumed boolean not null default false,
  consumed_at timestamptz null,
  consumed_by_fingerprint text null,
  stage_consumption_fingerprint text null,
  process_request_fingerprint text null,
  completion_recorded boolean not null default false,
  completion_fingerprint text null,
  interpretation_fingerprint text null,
  stage_outcome text null,
  stage_reason text null,
  completed_at timestamptz null,
  stage_transition_version bigint not null,
  stage_record_fingerprint text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint git_runner_authority_consumption_stages_record_stage_key
    unique (consumption_record_id, stage_index),
  constraint git_runner_authority_consumption_stages_stage_grant_key
    unique (consumption_record_id, stage_grant_fingerprint),
  constraint git_runner_authority_consumption_stages_index_check
    check (stage_index between 0 and 5),
  constraint git_runner_authority_consumption_stages_identity_map_check
    check (
      (stage_index = 0 and stage_identity = 'git_repository_root_v1')
      or (stage_index = 1 and stage_identity = 'git_object_format_v1')
      or (stage_index = 2 and stage_identity = 'git_head_before_v1')
      or (stage_index = 3 and stage_identity = 'git_branch_state_v1')
      or (stage_index = 4 and stage_identity = 'git_porcelain_status_v1')
      or (stage_index = 5 and stage_identity = 'git_head_after_v1')
    ),
  constraint git_runner_authority_consumption_stages_sha256_check
    check (
      authority_policy_fingerprint ~ '^[0-9a-f]{64}$'
      and stage_grant_fingerprint ~ '^[0-9a-f]{64}$'
      and stage_authority_fingerprint ~ '^[0-9a-f]{64}$'
      and stage_record_fingerprint ~ '^[0-9a-f]{64}$'
      and (consumed_by_fingerprint is null or consumed_by_fingerprint ~ '^[0-9a-f]{64}$')
      and (stage_consumption_fingerprint is null or stage_consumption_fingerprint ~ '^[0-9a-f]{64}$')
      and (process_request_fingerprint is null or process_request_fingerprint ~ '^[0-9a-f]{64}$')
      and (completion_fingerprint is null or completion_fingerprint ~ '^[0-9a-f]{64}$')
      and (interpretation_fingerprint is null or interpretation_fingerprint ~ '^[0-9a-f]{64}$')
    ),
  constraint git_runner_authority_consumption_stages_outcome_check
    check (
      stage_outcome is null
      or stage_outcome in (
        'accepted',
        'accepted_detached_observation',
        'rejected',
        'process_failed',
        'ambiguous_process_state'
      )
    ),
  constraint git_runner_authority_consumption_stages_reason_check
    check (
      stage_reason is null
      or stage_reason in (
        'stage_completion_recorded',
        'stage_failed_terminal',
        'ambiguous_failed_terminal'
      )
    ),
  constraint git_runner_authority_consumption_stages_consumption_group_check
    check (
      (
        consumed = false
        and consumed_at is null
        and consumed_by_fingerprint is null
        and stage_consumption_fingerprint is null
        and process_request_fingerprint is null
        and completion_recorded = false
      )
      or (
        consumed = true
        and consumed_at is not null
        and consumed_by_fingerprint is not null
        and stage_consumption_fingerprint is not null
        and process_request_fingerprint is not null
      )
    ),
  constraint git_runner_authority_consumption_stages_completion_group_check
    check (
      (
        completion_recorded = false
        and completion_fingerprint is null
        and interpretation_fingerprint is null
        and stage_outcome is null
        and stage_reason is null
        and completed_at is null
      )
      or (
        completion_recorded = true
        and consumed = true
        and completion_fingerprint is not null
        and stage_outcome is not null
        and stage_reason is not null
        and completed_at is not null
      )
    ),
  constraint git_runner_authority_consumption_stages_outcome_semantics_check
    check (
      stage_outcome is null
      or (
        stage_outcome = 'accepted'
        and stage_reason = 'stage_completion_recorded'
        and interpretation_fingerprint is not null
      )
      or (
        stage_outcome = 'accepted_detached_observation'
        and stage_index = 3
        and stage_reason = 'stage_completion_recorded'
        and interpretation_fingerprint is not null
      )
      or (
        stage_outcome in ('rejected', 'process_failed')
        and stage_reason = 'stage_failed_terminal'
        and interpretation_fingerprint is null
      )
      or (
        stage_outcome = 'ambiguous_process_state'
        and stage_reason = 'ambiguous_failed_terminal'
        and interpretation_fingerprint is null
      )
    ),
  constraint git_runner_authority_consumption_stages_transition_check
    check (stage_transition_version >= 1),
  constraint git_runner_authority_consumption_stages_timestamp_order_check
    check (
      created_at <= updated_at
      and (completed_at is null or consumed_at is not null)
      and (completed_at is null or completed_at >= consumed_at)
    )
);

create table public.git_runner_authority_consumption_audit_events (
  id uuid primary key default gen_random_uuid(),
  consumption_record_id uuid not null
    references public.git_runner_authority_consumption_records(id) on delete restrict,
  authority_package_id text not null,
  authority_package_fingerprint text not null,
  authority_policy_fingerprint text not null,
  consumption_key text not null,
  consumer_fingerprint text null,
  stage_index smallint null,
  stage_identity text null,
  event_sequence bigint not null,
  operation_identity text not null,
  event_status text not null,
  event_reason text not null,
  transition_version_before bigint not null,
  transition_version_after bigint not null,
  observed_at timestamptz not null,
  previous_state_fingerprint text null,
  next_state_core_fingerprint text not null,
  next_state_fingerprint text not null,
  relevant_evidence_fingerprint text null,
  prior_event_fingerprint text null,
  event_fingerprint text not null,
  runtime_activated boolean not null,
  authority text not null,
  toctou_eliminated boolean not null,
  created_at timestamptz not null default now(),
  constraint git_runner_authority_consumption_audit_record_sequence_key
    unique (consumption_record_id, event_sequence),
  constraint git_runner_authority_consumption_audit_event_fingerprint_key
    unique (event_fingerprint),
  constraint git_runner_authority_consumption_audit_identity_text_check
    check (
      length(btrim(authority_package_id)) > 0
      and length(btrim(consumption_key)) > 0
    ),
  constraint git_runner_authority_consumption_audit_sha256_check
    check (
      authority_package_fingerprint ~ '^[0-9a-f]{64}$'
      and authority_policy_fingerprint ~ '^[0-9a-f]{64}$'
      and next_state_core_fingerprint ~ '^[0-9a-f]{64}$'
      and next_state_fingerprint ~ '^[0-9a-f]{64}$'
      and event_fingerprint ~ '^[0-9a-f]{64}$'
      and (consumer_fingerprint is null or consumer_fingerprint ~ '^[0-9a-f]{64}$')
      and (previous_state_fingerprint is null or previous_state_fingerprint ~ '^[0-9a-f]{64}$')
      and (relevant_evidence_fingerprint is null or relevant_evidence_fingerprint ~ '^[0-9a-f]{64}$')
      and (prior_event_fingerprint is null or prior_event_fingerprint ~ '^[0-9a-f]{64}$')
    ),
  constraint git_runner_authority_consumption_audit_sequence_check
    check (
      event_sequence >= 1
      and transition_version_before >= 0
      and transition_version_after = transition_version_before + 1
    ),
  constraint git_runner_authority_consumption_audit_stage_check
    check (
      (
        stage_index is null
        and stage_identity is null
      )
      or (
        stage_index between 0 and 5
        and (
          (stage_index = 0 and stage_identity = 'git_repository_root_v1')
          or (stage_index = 1 and stage_identity = 'git_object_format_v1')
          or (stage_index = 2 and stage_identity = 'git_head_before_v1')
          or (stage_index = 3 and stage_identity = 'git_branch_state_v1')
          or (stage_index = 4 and stage_identity = 'git_porcelain_status_v1')
          or (stage_index = 5 and stage_identity = 'git_head_after_v1')
        )
      )
    ),
  constraint git_runner_authority_consumption_audit_operation_check
    check (
      operation_identity in (
        'register_package',
        'claim_consumer',
        'consume_stage',
        'record_stage_completion',
        'terminalize_failure',
        'terminalize_ambiguous_failure',
        'terminalize_expiry',
        'revoke_package',
        'finalize_aggregate'
      )
    ),
  constraint git_runner_authority_consumption_audit_status_check
    check (event_status in ('transition_permitted', 'transition_rejected')),
  constraint git_runner_authority_consumption_audit_reason_check
    check (
      event_reason in (
        'input_contract_rejected',
        'input_identity_rejected',
        'input_fingerprint_rejected',
        'current_state_rejected',
        'authority_package_rejected',
        'operation_rejected',
        'package_linkage_rejected',
        'consumer_linkage_rejected',
        'stale_transition_rejected',
        'state_transition_rejected',
        'package_terminal_rejected',
        'package_expired',
        'timestamp_rejected',
        'package_not_claimable',
        'concurrent_consumer_rejected',
        'stage_order_rejected',
        'stage_already_consumed',
        'stage_not_consumed',
        'stage_completion_already_recorded',
        'stage_prerequisite_rejected',
        'process_request_linkage_rejected',
        'completion_linkage_rejected',
        'detached_outcome_rejected',
        'failure_terminalization_rejected',
        'ambiguous_terminalization_rejected',
        'revocation_rejected',
        'expiry_transition_rejected',
        'aggregate_prerequisite_rejected',
        'aggregate_finalization_rejected',
        'package_registered',
        'consumer_claimed',
        'stage_authority_consumed',
        'stage_completion_recorded',
        'stage_failed_terminal',
        'ambiguous_failed_terminal',
        'package_expired_terminal',
        'package_revoked_terminal',
        'sequence_consumed',
        'duplicate_registration_rejected',
        'package_identity_conflict_rejected',
        'package_fingerprint_reuse_rejected',
        'storage_integrity_rejected',
        'storage_operation_rejected',
        'storage_operation_ambiguous',
        'wrong_consumer_rejected',
        'operator_revoked',
        'policy_revoked',
        'superseded_by_new_package'
      )
    ),
  constraint git_runner_authority_consumption_audit_runtime_authority_check
    check (
      runtime_activated = false
      and authority = 'none'
      and toctou_eliminated = false
    ),
  constraint git_runner_authority_consumption_audit_prior_event_check
    check (
      (event_sequence = 1 and prior_event_fingerprint is null)
      or (event_sequence > 1 and prior_event_fingerprint is not null)
    ),
  constraint git_runner_authority_consumption_audit_previous_state_check
    check (
      (operation_identity = 'register_package' and previous_state_fingerprint is null)
      or (operation_identity <> 'register_package' and previous_state_fingerprint is not null)
    )
);

create unique index git_runner_authority_consumption_stages_consumption_fingerprint_uidx
  on public.git_runner_authority_consumption_stages (stage_consumption_fingerprint)
  where stage_consumption_fingerprint is not null;

create unique index git_runner_authority_consumption_stages_process_request_uidx
  on public.git_runner_authority_consumption_stages (process_request_fingerprint)
  where process_request_fingerprint is not null;

create index git_runner_authority_consumption_records_state_expires_idx
  on public.git_runner_authority_consumption_records (state, expires_at)
  where terminal = false;

create index git_runner_authority_consumption_records_active_consumer_idx
  on public.git_runner_authority_consumption_records (active_consumer_fingerprint, state)
  where active_consumer_fingerprint is not null;

create index git_runner_authority_consumption_records_key_version_idx
  on public.git_runner_authority_consumption_records (consumption_key, transition_version);

create index git_runner_authority_consumption_records_transition_version_idx
  on public.git_runner_authority_consumption_records (transition_version);

create index git_runner_authority_consumption_stages_record_completion_idx
  on public.git_runner_authority_consumption_stages (
    consumption_record_id,
    consumed,
    completion_recorded
  );

create index git_runner_authority_consumption_audit_operation_created_idx
  on public.git_runner_authority_consumption_audit_events (
    operation_identity,
    created_at desc
  );

alter table public.git_runner_authority_consumption_records
  enable row level security;

alter table public.git_runner_authority_consumption_stages
  enable row level security;

alter table public.git_runner_authority_consumption_audit_events
  enable row level security;

revoke all privileges on table public.git_runner_authority_consumption_records
  from public, anon, authenticated;

revoke all privileges on table public.git_runner_authority_consumption_stages
  from public, anon, authenticated;

revoke all privileges on table public.git_runner_authority_consumption_audit_events
  from public, anon, authenticated;

comment on table public.git_runner_authority_consumption_records is
  'Action 622 storage schema only for dormant Git runner authority consumption records. No RPC, live authority consumption, Git execution, process/repository access, runtime activation, replay-safety claim, or deployment is created by this migration.';

comment on table public.git_runner_authority_consumption_stages is
  'Action 622 storage schema only for six fixed dormant Git runner stage records. Stage rows store fingerprints and closed state only; they store no raw argv, raw paths, Git output, process handles, credentials, or repository data.';

comment on table public.git_runner_authority_consumption_audit_events is
  'Action 622 append-only-by-permission audit storage for dormant Git runner authority consumption transitions. This migration grants no direct client mutation authority and creates no audit-update RPC.';

comment on column public.git_runner_authority_consumption_records.consumption_key is
  'Immutable one-shot package consumption key. Storage primitive only; no package is registered by this migration.';

comment on column public.git_runner_authority_consumption_records.authority_package_fingerprint is
  'Lowercase SHA-256 fingerprint of the final-approved dormant Git runner authority package.';

comment on column public.git_runner_authority_consumption_records.authority_policy_fingerprint is
  'Lowercase SHA-256 fingerprint of the source-controlled authority policy bound into package, stage, state, and audit evidence.';

comment on column public.git_runner_authority_consumption_records.current_stage_index is
  'Current six-stage cursor for future transactional RPC validation. It does not authorize execution by itself.';

comment on column public.git_runner_authority_consumption_records.transition_version is
  'CAS transition version for future reviewed RPCs. This migration creates no RPC and no runtime consumer.';

comment on column public.git_runner_authority_consumption_records.terminal_reason is
  'Closed terminal reason. Terminal state does not imply Git execution, repository inspection, or live runner completion.';

comment on column public.git_runner_authority_consumption_records.state_core_fingerprint is
  'Acyclic state-core fingerprint from the pure transition model, excluding the current audit event.';

comment on column public.git_runner_authority_consumption_records.state_fingerprint is
  'Final state fingerprint binding state core and latest audit event fingerprint. Fingerprints grant no authority.';

comment on column public.git_runner_authority_consumption_records.last_audit_event_fingerprint is
  'Latest audit event fingerprint in the acyclic Action 619-620 model.';

comment on column public.git_runner_authority_consumption_stages.stage_identity is
  'Closed fixed stage identity mapped by stage_index; caller-selected stage identities are rejected by CHECK constraints.';

comment on column public.git_runner_authority_consumption_stages.stage_consumption_fingerprint is
  'Lowercase SHA-256 stage-consumption fingerprint for future one-shot RPC enforcement. No authority is consumed by this migration.';

comment on column public.git_runner_authority_consumption_stages.process_request_fingerprint is
  'Lowercase SHA-256 process-request fingerprint. The schema stores no process handle, PID, raw command, or Git output.';

comment on column public.git_runner_authority_consumption_stages.interpretation_fingerprint is
  'Lowercase SHA-256 interpretation fingerprint required only for accepted stage outcomes according to the pure transition contract.';

comment on column public.git_runner_authority_consumption_audit_events.event_fingerprint is
  'Lowercase SHA-256 audit-event fingerprint. Audit rows are append-only through table permissions and future separately reviewed RPCs.';

comment on column public.git_runner_authority_consumption_audit_events.runtime_activated is
  'Must remain false. Action 622 adds no runtime/API/UI/runner activation.';

comment on column public.git_runner_authority_consumption_audit_events.authority is
  'Must remain none. Stored audit evidence grants no Git, process, repository-read, credential, network, staging, deployment, or trading authority.';

comment on column public.git_runner_authority_consumption_audit_events.toctou_eliminated is
  'Must remain false. Storage does not eliminate TOCTOU or replay risk without separately reviewed transactional RPCs and runtime boundaries.';

-- RLS is intentionally enabled with no anon/authenticated/client policies.
-- This migration creates no SECURITY DEFINER functions and no service-role
-- application code. Future RPC migrations must separately prove ownership,
-- fixed search_path, CAS, row locking, audit atomicity, closed error mapping,
-- and no direct client execution grants.
