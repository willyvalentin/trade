import { expect, test } from "@playwright/test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY } from "@/lib/post-trade-pure-aggregate-read-only-git-repository-observation-contract-core";
import {
  PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY,
  PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY,
} from "@/lib/post-trade-pure-dormant-git-runner-authority-package-contract-core";
import { PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY } from "@/lib/post-trade-pure-raw-process-completion-evidence-contract-core";

const repoRoot = process.cwd();
const migrationName = "20260720000000_create_git_runner_authority_consumption_storage.sql";
const migrationPath = join(repoRoot, "supabase", "migrations", migrationName);
const migrationSql = readFileSync(migrationPath, "utf8");
const normalizedSql = migrationSql.replace(/\s+/g, " ").toLowerCase();
const executableSql = migrationSql
  .replace(/--.*$/gmu, "")
  .replace(/'([^']|'')*'/gu, "''")
  .replace(/\s+/g, " ")
  .toLowerCase();

const tableNames = [
  "public.git_runner_authority_consumption_records",
  "public.git_runner_authority_consumption_stages",
  "public.git_runner_authority_consumption_audit_events",
] as const;

const packageColumns = [
  "id uuid primary key default gen_random_uuid()",
  "consumption_key text not null",
  "authority_package_id text not null",
  "authority_package_fingerprint text not null",
  "authority_policy_fingerprint text not null",
  "schema_identity text not null",
  "schema_version integer not null",
  "package_contract_identity text not null",
  "package_contract_version integer not null",
  "capability_set_identity text not null",
  "capability_set_version integer not null",
  "expiry_policy_identity text not null",
  "expiry_policy_version integer not null",
  "freshness_policy_identity text not null",
  "freshness_policy_version integer not null",
  "session_fingerprint text not null",
  "sequence_identity text not null",
  "sequence_fingerprint text not null",
  "executable_identity text not null",
  "executable_fingerprint text not null",
  "resolution_fingerprint text not null",
  "revalidation_fingerprint text not null",
  "worktree_fingerprint text not null",
  "compatibility_result_fingerprint text not null",
  "issued_at timestamptz not null",
  "expires_at timestamptz not null",
  "state text not null",
  "current_stage_index smallint not null",
  "consumed_stage_count smallint not null",
  "remaining_stage_count smallint not null",
  "transition_version bigint not null",
  "state_core_fingerprint text not null",
  "state_fingerprint text not null",
  "next_audit_sequence bigint not null",
] as const;

const stageColumns = [
  "id uuid primary key default gen_random_uuid()",
  "consumption_record_id uuid not null",
  "stage_index smallint not null",
  "stage_identity text not null",
  "authority_policy_fingerprint text not null",
  "stage_grant_fingerprint text not null",
  "stage_authority_fingerprint text not null",
  "consumed boolean not null default false",
  "completion_recorded boolean not null default false",
  "stage_transition_version bigint not null",
  "stage_record_fingerprint text not null",
] as const;

const auditColumns = [
  "id uuid primary key default gen_random_uuid()",
  "consumption_record_id uuid not null",
  "authority_package_id text not null",
  "authority_package_fingerprint text not null",
  "authority_policy_fingerprint text not null",
  "consumption_key text not null",
  "event_sequence bigint not null",
  "operation_identity text not null",
  "event_status text not null",
  "event_reason text not null",
  "transition_version_before bigint not null",
  "transition_version_after bigint not null",
  "observed_at timestamptz not null",
  "next_state_core_fingerprint text not null",
  "next_state_fingerprint text not null",
  "event_fingerprint text not null",
  "runtime_activated boolean not null",
  "authority text not null",
  "toctou_eliminated boolean not null",
] as const;

const stageIdentities = [
  "git_repository_root_v1",
  "git_object_format_v1",
  "git_head_before_v1",
  "git_branch_state_v1",
  "git_porcelain_status_v1",
  "git_head_after_v1",
] as const;

const transitionReasons = [
  "input_contract_rejected",
  "input_identity_rejected",
  "input_fingerprint_rejected",
  "current_state_rejected",
  "authority_package_rejected",
  "operation_rejected",
  "package_linkage_rejected",
  "consumer_linkage_rejected",
  "stale_transition_rejected",
  "state_transition_rejected",
  "package_terminal_rejected",
  "package_expired",
  "timestamp_rejected",
  "package_not_claimable",
  "concurrent_consumer_rejected",
  "stage_order_rejected",
  "stage_already_consumed",
  "stage_not_consumed",
  "stage_completion_already_recorded",
  "stage_prerequisite_rejected",
  "process_request_linkage_rejected",
  "completion_linkage_rejected",
  "detached_outcome_rejected",
  "failure_terminalization_rejected",
  "ambiguous_terminalization_rejected",
  "revocation_rejected",
  "expiry_transition_rejected",
  "aggregate_prerequisite_rejected",
  "aggregate_finalization_rejected",
  "package_registered",
  "consumer_claimed",
  "stage_authority_consumed",
  "stage_completion_recorded",
  "stage_failed_terminal",
  "ambiguous_failed_terminal",
  "package_expired_terminal",
  "package_revoked_terminal",
  "sequence_consumed",
] as const;

function expectSqlContains(fragment: string) {
  expect(normalizedSql, `missing SQL fragment: ${fragment}`).toContain(
    fragment.toLowerCase().replace(/\s+/g, " "),
  );
}

function expectAllFragments(fragments: readonly string[]) {
  for (const fragment of fragments) {
    expectSqlContains(fragment);
  }
}

function normalizedConstraint(name: string) {
  const start = normalizedSql.indexOf(`constraint ${name.toLowerCase()}`);
  expect(start, `missing constraint ${name}`).toBeGreaterThanOrEqual(0);
  const next = normalizedSql.indexOf(" constraint ", start + 1);
  return normalizedSql.slice(start, next === -1 ? undefined : next);
}

test.describe("Action 622 Git runner authority consumption storage migration", () => {
  test("migration file identity is exact and timestamp has no collision", () => {
    expect(existsSync(migrationPath)).toBe(true);
    const matchingTimestamp = readdirSync(join(repoRoot, "supabase", "migrations"))
      .filter((name) => name.startsWith("20260720000000"));

    expect(matchingTimestamp).toEqual([migrationName]);
    expect(normalizedSql).not.toContain(
      "20260710000000_create_execution_authorization_consumptions",
    );
  });

  test("migration creates exactly the three approved storage tables", () => {
    for (const tableName of tableNames) {
      expectSqlContains(`create table ${tableName}`);
    }
    expect(normalizedSql).not.toContain("create table public.execution_authorization_consumptions");
    expect(normalizedSql).not.toContain("create table if not exists");
  });

  test("package table carries the required identity linkage and state columns", () => {
    expectAllFragments(packageColumns);
    expectSqlContains("last_audit_event_fingerprint text null");
    expectSqlContains("active_consumer_fingerprint text null");
    expectSqlContains("aggregate_fingerprint text null");
  });

  test("stage table carries the required stage consumption columns", () => {
    expectAllFragments(stageColumns);
    expectSqlContains("stage_consumption_fingerprint text null");
    expectSqlContains("process_request_fingerprint text null");
    expectSqlContains("completion_fingerprint text null");
    expectSqlContains("interpretation_fingerprint text null");
  });

  test("audit table carries the required append-only event columns", () => {
    expectAllFragments(auditColumns);
    expectSqlContains("previous_state_fingerprint text null");
    expectSqlContains("prior_event_fingerprint text null");
    expectSqlContains("relevant_evidence_fingerprint text null");
    expect(normalizedSql).not.toContain(" jsonb ");
  });

  test("package state and stage outcome values are CHECK-backed and closed", () => {
    for (const state of [
      "issued",
      "active",
      "partially_consumed",
      "consumed",
      "failed_consumed",
      "ambiguous_failed_consumed",
      "expired",
      "revoked",
    ]) {
      expectSqlContains(`'${state}'`);
    }
    for (const outcome of [
      "accepted",
      "accepted_detached_observation",
      "rejected",
      "process_failed",
      "ambiguous_process_state",
    ]) {
      expectSqlContains(`'${outcome}'`);
    }
    expectSqlContains("constraint git_runner_authority_consumption_records_state_check");
    expectSqlContains("constraint git_runner_authority_consumption_stages_outcome_check");
  });

  test("audit operations statuses and reasons are CHECK-backed and closed", () => {
    for (const operation of [
      "register_package",
      "claim_consumer",
      "consume_stage",
      "record_stage_completion",
      "terminalize_failure",
      "terminalize_ambiguous_failure",
      "terminalize_expiry",
      "revoke_package",
      "finalize_aggregate",
    ]) {
      expectSqlContains(`'${operation}'`);
    }
    expectSqlContains("'transition_permitted'");
    expectSqlContains("'transition_rejected'");
    for (const reason of transitionReasons) {
      expectSqlContains(`'${reason}'`);
    }
    expectSqlContains("constraint git_runner_authority_consumption_audit_reason_check");
  });

  test("every fingerprint field uses lowercase SHA-256 CHECK grammar", () => {
    const fingerprintColumns = [
      "authority_package_fingerprint",
      "authority_policy_fingerprint",
      "session_fingerprint",
      "sequence_fingerprint",
      "executable_fingerprint",
      "resolution_fingerprint",
      "revalidation_fingerprint",
      "worktree_fingerprint",
      "compatibility_result_fingerprint",
      "active_consumer_fingerprint",
      "aggregate_fingerprint",
      "state_core_fingerprint",
      "state_fingerprint",
      "last_audit_event_fingerprint",
      "stage_grant_fingerprint",
      "stage_authority_fingerprint",
      "stage_record_fingerprint",
      "consumed_by_fingerprint",
      "stage_consumption_fingerprint",
      "process_request_fingerprint",
      "completion_fingerprint",
      "interpretation_fingerprint",
      "previous_state_fingerprint",
      "next_state_core_fingerprint",
      "next_state_fingerprint",
      "relevant_evidence_fingerprint",
      "prior_event_fingerprint",
      "event_fingerprint",
    ];

    for (const column of fingerprintColumns) {
      expect(normalizedSql, `${column} missing SHA-256 grammar`).toContain(
        `${column} ~ '^[0-9a-f]{64}$'`,
      );
    }
    expect(normalizedSql).not.toContain("[a-f0-9]{40}");
    expect(normalizedSql).not.toContain("[a-fa-f0-9]");
  });

  test("package invariants pin versions progress expiry terminal flags and no retry", () => {
    expectSqlContains("schema_version = 1");
    expectSqlContains("package_contract_version = 1");
    expectSqlContains("current_stage_index between 0 and 6");
    expectSqlContains("consumed_stage_count + remaining_stage_count = 6");
    expectSqlContains("retry_count = 0");
    expectSqlContains("fallback_attempted = false");
    expectSqlContains("expires_at = issued_at + interval '30 seconds'");
    expectSqlContains("expired = (state = 'expired')");
    expectSqlContains("revoked = (state = 'revoked')");
    expectSqlContains("terminal_reason = 'sequence_consumed'");
  });

  test("package semantic identities are exact source-controlled values", () => {
    expectSqlContains("constraint git_runner_authority_consumption_records_exact_identity_check");
    expectSqlContains("schema_identity = 'ture.execution.dormant-git-runner-authority-consumption-storage.schema-family.v1'");
    expectSqlContains(`package_contract_identity = '${PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_CONTRACT_IDENTITY.contractId}'`);
    expectSqlContains(`capability_set_identity = '${PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.capabilitySetId}'`);
    expectSqlContains(`expiry_policy_identity = '${PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.expiryPolicyId}'`);
    expectSqlContains(`freshness_policy_identity = '${PURE_DORMANT_GIT_RUNNER_AUTHORITY_PACKAGE_POLICY.freshnessPolicyId}'`);
    expectSqlContains(`sequence_identity = '${PURE_AGGREGATE_READ_ONLY_GIT_REPOSITORY_OBSERVATION_POLICY.sequenceIdentity}'`);
    expectSqlContains(`source_policy_identity = '${PURE_RAW_PROCESS_COMPLETION_EVIDENCE_POLICY.policyId}'`);
    expectSqlContains("platform = 'macos'");
    expectSqlContains("executable_identity = '/usr/bin/git'");
  });

  test("package semantic identities are not accepted by nonempty text checks alone", () => {
    const identityTextCheck = normalizedConstraint("git_runner_authority_consumption_records_identity_text_check");

    for (const formerlyLooseField of [
      "schema_identity",
      "package_contract_identity",
      "capability_set_identity",
      "expiry_policy_identity",
      "freshness_policy_identity",
      "sequence_identity",
      "platform",
      "source_policy_identity",
    ]) {
      expect(identityTextCheck).not.toContain(`length(btrim(${formerlyLooseField})) > 0`);
    }
  });

  test("terminal reason vocabulary is narrowed to package terminal reasons only", () => {
    const terminalReasonCheck = normalizedConstraint("git_runner_authority_consumption_records_terminal_reason_check");

    for (const reason of [
      "stage_failed_terminal",
      "ambiguous_failed_terminal",
      "package_expired_terminal",
      "package_revoked_terminal",
      "sequence_consumed",
    ]) {
      expect(terminalReasonCheck).toContain(`'${reason}'`);
    }
    expect(terminalReasonCheck).not.toContain("'operator_revoked'");
    expect(terminalReasonCheck).not.toContain("'policy_revoked'");
    expect(terminalReasonCheck).not.toContain("'superseded_by_new_package'");
  });

  test("state progress semantics are SQL UNKNOWN-safe with a closed CASE expression", () => {
    const stateProgressCheck = normalizedConstraint("git_runner_authority_consumption_records_state_progress_check");

    expect(stateProgressCheck).toContain("case state");
    expect(stateProgressCheck).toContain("else false");
    for (const state of [
      "issued",
      "active",
      "partially_consumed",
      "consumed",
      "failed_consumed",
      "ambiguous_failed_consumed",
      "expired",
      "revoked",
    ]) {
      expect(stateProgressCheck).toContain(`when '${state}' then`);
    }
  });

  test("nonterminal package states bind exact terminal nullability and active-consumer posture", () => {
    const stateProgressCheck = normalizedConstraint("git_runner_authority_consumption_records_state_progress_check");

    expect(stateProgressCheck).toContain("when 'issued' then current_stage_index = 0 and consumed_stage_count = 0 and remaining_stage_count = 6");
    expect(stateProgressCheck).toContain("when 'active' then current_stage_index = 0 and consumed_stage_count = 0 and remaining_stage_count = 6");
    expect(stateProgressCheck).toContain("when 'partially_consumed' then current_stage_index between 0 and 6 and consumed_stage_count between 1 and 6");
    expect(stateProgressCheck).toContain("terminal_reason is null");
    expect(stateProgressCheck).toContain("terminal_at is null");
    expect(stateProgressCheck).toContain("active_consumer_id is not null");
    expect(stateProgressCheck).toContain("active_consumer_fingerprint is not null");
    expect(stateProgressCheck).toContain("aggregate_fingerprint is null");
  });

  test("consumed terminal state binds exact progress aggregate and sequence reason", () => {
    const stateProgressCheck = normalizedConstraint("git_runner_authority_consumption_records_state_progress_check");

    expect(stateProgressCheck).toContain("when 'consumed' then current_stage_index = 6 and consumed_stage_count = 6 and remaining_stage_count = 0");
    expect(stateProgressCheck).toContain("terminal_reason = 'sequence_consumed'");
    expect(stateProgressCheck).toContain("aggregate_fingerprint is not null");
  });

  test("failed terminal states bind exact failure reasons and at least one consumed stage", () => {
    const stateProgressCheck = normalizedConstraint("git_runner_authority_consumption_records_state_progress_check");

    expect(stateProgressCheck).toContain("when 'failed_consumed' then current_stage_index between 0 and 5 and consumed_stage_count between 1 and 6");
    expect(stateProgressCheck).toContain("terminal_reason = 'stage_failed_terminal'");
    expect(stateProgressCheck).toContain("when 'ambiguous_failed_consumed' then current_stage_index between 0 and 5 and consumed_stage_count between 1 and 6");
    expect(stateProgressCheck).toContain("terminal_reason = 'ambiguous_failed_terminal'");
  });

  test("expired and revoked terminal states bind exact flags and exact terminal reasons", () => {
    const stateProgressCheck = normalizedConstraint("git_runner_authority_consumption_records_state_progress_check");

    expect(stateProgressCheck).toContain("when 'expired' then current_stage_index between 0 and 6 and terminal = true and terminal_reason = 'package_expired_terminal'");
    expect(stateProgressCheck).toContain("expired = true and revoked = false");
    expect(stateProgressCheck).toContain("when 'revoked' then current_stage_index between 0 and 6 and terminal = true and terminal_reason = 'package_revoked_terminal'");
    expect(stateProgressCheck).toContain("expired = false and revoked = true");
  });

  test("terminal contradiction matrix is represented by opposite CHECK predicates", () => {
    const stateProgressCheck = normalizedConstraint("git_runner_authority_consumption_records_state_progress_check");
    const contradictoryRows = [
      { state: "failed_consumed", forbiddenReason: "sequence_consumed", requiredReason: "stage_failed_terminal" },
      { state: "ambiguous_failed_consumed", forbiddenReason: "sequence_consumed", requiredReason: "ambiguous_failed_terminal" },
      { state: "expired", forbiddenReason: "stage_failed_terminal", requiredReason: "package_expired_terminal" },
      { state: "revoked", forbiddenReason: "operator_revoked", requiredReason: "package_revoked_terminal" },
    ] as const;

    for (const row of contradictoryRows) {
      expect(stateProgressCheck, `${row.state} branch must exist`).toContain(`when '${row.state}' then`);
      expect(stateProgressCheck, `${row.state} must require exact reason`).toContain(`terminal_reason = '${row.requiredReason}'`);
      expect(stateProgressCheck, `${row.state} branch must not accept ${row.forbiddenReason}`).not.toMatch(
        new RegExp(`when '${row.state}' then[\\s\\S]*?terminal_reason = '${row.forbiddenReason}'`, "u"),
      );
    }
  });

  test("failed terminal rows with zero consumed progress are closed by row-local CHECKs", () => {
    const stateProgressCheck = normalizedConstraint("git_runner_authority_consumption_records_state_progress_check");

    expect(stateProgressCheck).toContain("when 'failed_consumed' then current_stage_index between 0 and 5 and consumed_stage_count between 1 and 6");
    expect(stateProgressCheck).toContain("when 'ambiguous_failed_consumed' then current_stage_index between 0 and 5 and consumed_stage_count between 1 and 6");
    expect(stateProgressCheck).not.toMatch(/when 'failed_consumed' then[\s\S]*?consumed_stage_count between 0 and/u);
    expect(stateProgressCheck).not.toMatch(/when 'ambiguous_failed_consumed' then[\s\S]*?consumed_stage_count between 0 and/u);
  });

  test("terminal states cannot retain active consumer fields or stale aggregate posture", () => {
    const stateProgressCheck = normalizedConstraint("git_runner_authority_consumption_records_state_progress_check");

    for (const state of ["failed_consumed", "ambiguous_failed_consumed", "expired", "revoked"]) {
      expect(stateProgressCheck).toMatch(
        new RegExp(`when '${state}' then[\\s\\S]*?active_consumer_id is null[\\s\\S]*?active_consumer_fingerprint is null[\\s\\S]*?active_consumer_claimed_at is null[\\s\\S]*?aggregate_fingerprint is null`, "u"),
      );
    }
  });

  test("package active consumer and aggregate nullability are constrained", () => {
    expectSqlContains("constraint git_runner_authority_consumption_records_consumer_group_check");
    expectSqlContains("active_consumer_id is null");
    expectSqlContains("active_consumer_id is not null");
    expectSqlContains("(state = 'consumed' and aggregate_fingerprint is not null)");
    expectSqlContains("(state <> 'consumed' and aggregate_fingerprint is null)");
  });

  test("stage index is bound to exact approved stage identities", () => {
    stageIdentities.forEach((identity, index) => {
      expectSqlContains(`stage_index = ${index} and stage_identity = '${identity}'`);
    });
    expectSqlContains("constraint git_runner_authority_consumption_stages_identity_map_check");
    expectSqlContains("constraint git_runner_authority_consumption_audit_stage_check");
  });

  test("stage nullability distinguishes unconsumed consumed-pending and completed states", () => {
    expectSqlContains("consumed = false");
    expectSqlContains("consumed_at is null");
    expectSqlContains("stage_consumption_fingerprint is null");
    expectSqlContains("consumed = true");
    expectSqlContains("consumed_at is not null");
    expectSqlContains("process_request_fingerprint is not null");
    expectSqlContains("completion_recorded = false");
    expectSqlContains("completion_recorded = true");
    expectSqlContains("completion_fingerprint is not null");
    expectSqlContains("completed_at is not null");
  });

  test("stage outcome semantics reject detached misuse and failed interpretation fingerprints", () => {
    expectSqlContains("stage_outcome = 'accepted_detached_observation'");
    expectSqlContains("stage_index = 3");
    expectSqlContains("stage_outcome in ('rejected', 'process_failed')");
    expectSqlContains("interpretation_fingerprint is null");
    expectSqlContains("stage_outcome = 'ambiguous_process_state'");
    expectSqlContains("stage_reason = 'ambiguous_failed_terminal'");
  });

  test("unique constraints and future transaction indexes are named and scoped", () => {
    for (const name of [
      "git_runner_authority_consumption_records_consumption_key_key",
      "git_runner_authority_consumption_records_package_id_key",
      "git_runner_authority_consumption_records_package_fingerprint_key",
      "git_runner_authority_consumption_records_package_pair_key",
      "git_runner_authority_consumption_stages_record_stage_key",
      "git_runner_authority_consumption_stages_stage_grant_key",
      "git_runner_authority_consumption_stages_consumption_fingerprint_uidx",
      "git_runner_authority_consumption_stages_process_request_uidx",
      "git_runner_authority_consumption_audit_record_sequence_key",
      "git_runner_authority_consumption_audit_event_fingerprint_key",
      "git_runner_authority_consumption_records_state_expires_idx",
      "git_runner_authority_consumption_records_active_consumer_idx",
      "git_runner_authority_consumption_records_key_version_idx",
      "git_runner_authority_consumption_stages_record_completion_idx",
      "git_runner_authority_consumption_audit_operation_created_idx",
    ]) {
      expectSqlContains(name);
    }
  });

  test("foreign keys preserve immutable package linkage with delete restriction", () => {
    expectSqlContains(
      "references public.git_runner_authority_consumption_records(id) on delete restrict",
    );
    expect(normalizedSql).not.toContain("on delete cascade");
    expect(normalizedSql).not.toContain("on delete set null");
  });

  test("audit invariants pin sequence versions runtime authority and prior-event posture", () => {
    expectSqlContains("event_sequence >= 1");
    expectSqlContains("transition_version_after = transition_version_before + 1");
    expectSqlContains("runtime_activated = false");
    expectSqlContains("authority = 'none'");
    expectSqlContains("toctou_eliminated = false");
    expectSqlContains("event_sequence = 1 and prior_event_fingerprint is null");
    expectSqlContains("event_sequence > 1 and prior_event_fingerprint is not null");
  });

  test("RLS is enabled and direct client table privileges are revoked", () => {
    for (const tableName of tableNames) {
      expectSqlContains(`alter table ${tableName} enable row level security`);
      expectSqlContains(`revoke all privileges on table ${tableName} from public, anon, authenticated`);
    }
    expect(normalizedSql).not.toContain("create policy");
    expect(normalizedSql).not.toContain("grant select");
    expect(normalizedSql).not.toContain("grant insert");
    expect(normalizedSql).not.toContain("grant update");
    expect(normalizedSql).not.toContain("grant delete");
  });

  test("migration creates no RPC functions or SECURITY DEFINER behavior", () => {
    expect(executableSql).not.toContain("create function");
    expect(executableSql).not.toContain("create or replace function");
    expect(executableSql).not.toContain("security definer");
    expect(executableSql).not.toContain("set search_path");
    expect(executableSql).not.toContain("execute on function");
  });

  test("schema does not store raw sensitive or live process data", () => {
    for (const forbiddenColumnPattern of [
      /\braw_path\s+text\b/u,
      /\bpath\s+text\b/u,
      /\braw_argv\s+text\b/u,
      /\bargv\s+text\b/u,
      /\bstdout\s+text\b/u,
      /\bstderr\s+text\b/u,
      /\bgit_output\s+text\b/u,
      /\benvironment\s+text\b/u,
      /\bcredential\s+text\b/u,
      /\bprocess_id\s+/u,
      /\bpid\s+/u,
      /\bprocess_handle\s+/u,
      /\bsqlstate\s+text\b/u,
      /\bstack_trace\s+text\b/u,
      /\bquery_text\s+text\b/u,
    ]) {
      expect(normalizedSql).not.toMatch(forbiddenColumnPattern);
    }
  });

  test("comments explicitly preserve non-runtime and non-authoritative posture", () => {
    for (const phrase of [
      "storage schema only",
      "no rpc",
      "live authority",
      "consumption behavior",
      "git execution path",
      "process/repository access",
      "no runtime",
      "fingerprints grant no authority",
      "creates no security definer functions",
    ]) {
      expect(normalizedSql, `missing comment posture phrase: ${phrase}`).toContain(phrase);
    }
  });
});
