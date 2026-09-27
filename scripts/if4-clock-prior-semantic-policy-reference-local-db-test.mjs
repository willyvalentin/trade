#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const container = `ture-if4-semantic-policy-${process.pid}`;
const sqlPath = join(tmpdir(), `${container}.sql`);
const migrationPath = new URL(
  "../supabase/migrations/20260927090000_if4_clock_prior_semantic_policy_reference.sql",
  import.meta.url,
);
const terminalReasonMigrationPath = new URL(
  "../supabase/migrations/20260927114500_if4_forward_decision_terminal_reasons.sql",
  import.meta.url,
);

function docker(...args) {
  return execFileSync("docker", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function psql(sql) {
  writeFileSync(sqlPath, sql, "utf8");
  docker("cp", sqlPath, `${container}:/tmp/test.sql`);
  return docker(
    "exec", "-e", "PGPASSWORD=postgres", container, "psql", "-v",
    "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-f",
    "/tmp/test.sql",
  );
}

const owner = "11111111-1111-4111-8111-111111111111";
const charterId = "22222222-2222-4222-8222-222222222222";
const charterFingerprint = "a".repeat(64);
const referenceFingerprint = "b".repeat(64);
const planFingerprint = "c".repeat(64);
const resultFingerprint = "d".repeat(64);
const tupleBaselineDigest = "e".repeat(64);
const tupleCandidateDigest = "f".repeat(64);
const differenceDigest = "1".repeat(64);
const segment = "clock-prior:all-us-equities";
const hypothesis =
  "Removing named clock priors improves canonical top-one precision on the same candidate population.";
const sharedTuple = {
  tuple_version: "canonical_shadow_version_tuple_v1",
  engine_version: "engine_v1",
  scoring_version: "scoring_v1",
  threshold_policy_version: "shadow_rank_only_diagnostic_threshold_v1",
  setup_taxonomy_version: "setup_v1",
  confidence_contract_version: "confidence_v1",
  evaluator_version: "evaluator_v1",
  provider_contract_version: "provider_v1",
  semantic_digest_algorithm: "sha256_canonical_json_v1",
};
const policyReference = {
  contract_version: "scanner_clock_prior_shadow_policy_reference_v1",
  reference_fingerprint: referenceFingerprint,
  created_at: "2026-01-01T11:00:00.000Z",
  owner_user_id: owner,
  segment_key: segment,
  evaluation_charter_id: charterId,
  evaluation_charter_fingerprint: charterFingerprint,
  baseline_version_tuple: {
    ...sharedTuple,
    ranking_version: "scanner_candidate_ranking_v1.2",
    semantic_digest: tupleBaselineDigest,
  },
  candidate_version_tuple: {
    ...sharedTuple,
    ranking_version: "scanner_candidate_ranking_clock_neutral_v1",
    semantic_digest: tupleCandidateDigest,
  },
  version_difference_set: {
    difference_set_version: "canonical_shadow_version_difference_set_v1",
    baseline_version_tuple_digest: tupleBaselineDigest,
    candidate_version_tuple_digest: tupleCandidateDigest,
    differences: ["ranking_version"],
    semantic_digest_algorithm: "sha256_canonical_json_v1",
    semantic_digest: differenceDigest,
  },
  source_revision: {
    recommendation_publish_policy_version: "publish_v1",
    git_commit: "fixture-commit",
    build_identity: "fixture-build",
  },
  evidence_classification: "semantic_identity_not_quality_baseline",
  quality_evidence_status: "not_evaluated",
  generic_learning_baseline_required_for_promotion: true,
  shadow_only: true,
  live_ranking_effect: false,
  publication_effect: false,
  promotion_effect: false,
  provider_effect: false,
  broker_effect: false,
};
const plan = {
  contract_version: "scanner_clock_prior_shadow_forward_decision_plan_v2",
  plan_fingerprint: planFingerprint,
  created_at: "2026-01-02T12:00:00.000Z",
  owner_user_id: owner,
  segment_key: segment,
  hypothesis,
  evaluation_charter_id: charterId,
  evaluation_charter_fingerprint: charterFingerprint,
  policy_reference: policyReference,
  baseline_ranking_version: "scanner_candidate_ranking_v1.2",
  candidate_ranking_version: "scanner_candidate_ranking_clock_neutral_v1",
  primary_k: 1,
  windows: {
    held_out: {
      start_at: "2026-01-03T14:30:00.000Z",
      end_at: "2026-01-08T21:00:00.000Z",
      minimum_opportunity_sets: 2,
      minimum_ranked_candidates: 10,
      minimum_trading_days: 3,
    },
    walk_forward: {
      start_at: "2026-01-09T14:30:00.000Z",
      end_at: "2026-01-16T21:00:00.000Z",
      minimum_opportunity_sets: 2,
      minimum_ranked_candidates: 10,
      minimum_trading_days: 3,
    },
  },
  thresholds: {
    continue_minimum_precision_delta: 0.03,
    reject_maximum_precision_delta: -0.02,
  },
};
const partition = (name) => ({
  partition: name,
  opportunity_set_count: 4,
  no_trade_opportunity_set_count: 1,
  ranked_candidate_count: 12,
  trading_day_count: 4,
  baseline_precision: { value: 0.5, numerator: 6, denominator: 12, lower: 0.4, upper: 0.6 },
  candidate_precision: { value: 2 / 3, numerator: 8, denominator: 12, lower: 0.5, upper: 0.8 },
  precision_delta: {
    value: 1 / 6,
    conservative_lower: 0.05,
    conservative_upper: 0.3,
    interval_method: "seeded_trading_day_cluster_bootstrap_v1",
    bootstrap_iterations: 1000,
    bootstrap_seed: `clock-prior-${name}`,
  },
  evidence_complete: true,
  reason_codes: [],
});
const result = {
  contract_version: "scanner_clock_prior_shadow_forward_decision_v2",
  status: "decision_ready",
  decision: "continue",
  plan_fingerprint: planFingerprint,
  evidence_binding: {
    owner_user_id: owner,
    segment_key: segment,
    evaluation_charter_id: charterId,
    evaluation_charter_fingerprint: charterFingerprint,
    policy_reference_fingerprint: referenceFingerprint,
  },
  partitions: [partition("held_out"), partition("walk_forward")],
  reason_codes: ["both_partitions_clear_continue_boundary"],
  shadow_only: true,
  live_ranking_effect: false,
  publication_effect: false,
  causal_improvement_claimed: false,
  authority: {
    can_change_ranking_or_publication: false,
    can_promote_policy: false,
    can_request_provider_data: false,
    can_execute_broker_action: false,
  },
};

try {
  docker("run", "--rm", "-d", "--name", container, "-e", "POSTGRES_PASSWORD=postgres", "postgres:17-alpine");
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      docker("exec", "-e", "PGPASSWORD=postgres", container, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-c", "select 1");
      break;
    } catch {
      if (attempt === 79) throw new Error("PostgreSQL did not become SQL-ready");
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  // The image briefly exposes its initialization server before restarting the
  // final postmaster. Avoid racing that handoff.
  await new Promise((resolve) => setTimeout(resolve, 1_000));
  psql(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin;
    create table public.recommendation_evaluation_charters (
      id uuid primary key, owner_user_id uuid not null, segment_key text not null,
      charter_fingerprint text not null, policy_attribution jsonb not null,
      charter_json jsonb not null, created_at timestamptz not null
    );
  `);
  psql(readFileSync(migrationPath, "utf8"));
  psql(readFileSync(terminalReasonMigrationPath, "utf8"));
  psql(`
    insert into public.recommendation_evaluation_charters values (
      '${charterId}', '${owner}', '${segment}', '${charterFingerprint}',
      '{"recommendation_publish_policy_version":"publish_v1","canonical_evaluation_versions":{"ranking_version":"scanner_candidate_ranking_v1.2","git_commit":"fixture-commit","build_identity":"fixture-build"}}',
      '${JSON.stringify({ hypothesis })}'::jsonb,
      '2026-01-01T11:00:00.000Z'
    );
    do $$ begin
      if has_table_privilege('service_role', 'public.scanner_clock_prior_shadow_forward_decision_plans_v2', 'select')
         or not has_function_privilege('service_role', 'public.record_scanner_clock_prior_shadow_forward_decision_plan_v2(uuid,text,jsonb,text)', 'execute')
         or has_function_privilege('anon', 'public.record_scanner_clock_prior_shadow_forward_decision_plan_v2(uuid,text,jsonb,text)', 'execute')
      then raise exception 'receipt privilege boundary is not server-RPC-only'; end if;
    end $$;
    set role service_role;
    create temporary table first_plan as
      select * from public.record_scanner_clock_prior_shadow_forward_decision_plan_v2(
        '${owner}', '${planFingerprint}', '${JSON.stringify(plan)}'::jsonb,
        'scanner_clock_prior_shadow_forward_decision_receipt_v2');
    create temporary table repeated_plan as
      select * from public.record_scanner_clock_prior_shadow_forward_decision_plan_v2(
        '${owner}', '${planFingerprint}', '${JSON.stringify(plan)}'::jsonb,
        'scanner_clock_prior_shadow_forward_decision_receipt_v2');
    create temporary table first_result as
      select * from public.record_scanner_clock_prior_shadow_forward_decision_result_v2(
        '${owner}', (select plan_id from first_plan), '${planFingerprint}',
        '${resultFingerprint}', '${JSON.stringify(result)}'::jsonb,
        'scanner_clock_prior_shadow_forward_decision_receipt_v2');
    create temporary table rejected_reason as
      select * from public.record_scanner_clock_prior_shadow_forward_decision_result_v2(
        '${owner}', (select plan_id from first_plan), '${planFingerprint}',
        '${"2".repeat(64)}',
        '${JSON.stringify({
          ...result,
          reason_codes: [
            "complete_evidence_does_not_clear_continue_or_reject_boundary",
          ],
        })}'::jsonb,
        'scanner_clock_prior_shadow_forward_decision_receipt_v2');
    reset role;
    do $$ begin
      if (select write_status from first_plan) <> 'plan_recorded'
         or (select write_status from repeated_plan) <> 'plan_already_recorded'
         or not (select idempotent from repeated_plan)
         or (select write_status from first_result) <> 'result_recorded'
         or (select write_status from rejected_reason) <> 'unavailable'
         or (select blocker from rejected_reason) <>
           'clock_prior_forward_decision_result_v2_contract_invalid'
         or (select count(*) from public.scanner_clock_prior_shadow_forward_decision_plans_v2) <> 1
         or (select count(*) from public.scanner_clock_prior_shadow_forward_decision_results_v2) <> 1
      then raise exception
        'durable forward receipt lifecycle did not match contract: first_plan=%, repeated_plan=%, first_result=%/%, rejected_reason=%/%',
        (select write_status from first_plan),
        (select write_status from repeated_plan),
        (select write_status from first_result),
        (select blocker from first_result),
        (select write_status from rejected_reason),
        (select blocker from rejected_reason);
      end if;
    end $$;
    do $$ begin
      begin
        update public.scanner_clock_prior_shadow_forward_decision_plans_v2 set segment_key = 'forged';
        raise exception 'immutable plan update unexpectedly succeeded';
      exception when sqlstate '55000' then null;
      end;
    end $$;
  `);
  console.log("IF-4 semantic policy reference local DB test passed.");
} finally {
  try { docker("rm", "-f", container); } catch {}
  rmSync(sqlPath, { force: true });
}
