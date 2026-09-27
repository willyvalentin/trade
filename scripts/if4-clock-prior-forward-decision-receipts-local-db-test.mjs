#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const container = `ture-if4-forward-receipts-${process.pid}`;
const sqlPath = join(tmpdir(), `${container}.sql`);
const migrationPath = new URL(
  "../supabase/migrations/20260927041020_if4_clock_prior_forward_decision_receipts.sql",
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
    "exec",
    "-e",
    "PGPASSWORD=postgres",
    container,
    "psql",
    "-v",
    "ON_ERROR_STOP=1",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-f",
    "/tmp/test.sql",
  );
}

const owner = "11111111-1111-4111-8111-111111111111";
const charterId = "22222222-2222-4222-8222-222222222222";
const baselineId = "33333333-3333-4333-8333-333333333333";
const planFingerprint = "c".repeat(64);
const resultFingerprint = "d".repeat(64);
const charterFingerprint = "a".repeat(64);
const baselineFingerprint = "b".repeat(64);
const segment = "clock-prior:all-us-equities";
const hypothesis =
  "Removing named clock priors improves canonical top-one precision on the same candidate population.";

const plan = {
  contract_version: "scanner_clock_prior_shadow_forward_decision_plan_v1",
  plan_fingerprint: planFingerprint,
  created_at: "2026-01-02T12:00:00.000Z",
  owner_user_id: owner,
  segment_key: segment,
  hypothesis,
  evaluation_charter_id: charterId,
  evaluation_charter_fingerprint: charterFingerprint,
  baseline_id: baselineId,
  baseline_fingerprint: baselineFingerprint,
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

const proportion = (value, numerator, denominator) => ({
  value,
  numerator,
  denominator,
  lower: Math.max(0, value - 0.1),
  upper: Math.min(1, value + 0.1),
});
const partition = (name) => ({
  partition: name,
  opportunity_set_count: 4,
  no_trade_opportunity_set_count: 0,
  ranked_candidate_count: 12,
  trading_day_count: 4,
  baseline_precision: proportion(0.5, 6, 12),
  candidate_precision: proportion(2 / 3, 8, 12),
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
  contract_version: "scanner_clock_prior_shadow_forward_decision_v1",
  status: "decision_ready",
  decision: "continue",
  plan_fingerprint: planFingerprint,
  evidence_binding: {
    owner_user_id: owner,
    segment_key: segment,
    evaluation_charter_id: charterId,
    evaluation_charter_fingerprint: charterFingerprint,
    baseline_id: baselineId,
    baseline_fingerprint: baselineFingerprint,
  },
  partitions: [partition("held_out"), partition("walk_forward")],
  reason_codes: [],
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
  docker(
    "run",
    "--rm",
    "-d",
    "--name",
    container,
    "-e",
    "POSTGRES_PASSWORD=postgres",
    "postgres:17-alpine",
  );
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      docker(
        "exec",
        "-e",
        "PGPASSWORD=postgres",
        container,
        "psql",
        "-v",
        "ON_ERROR_STOP=1",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-c",
        "select 1",
      );
      break;
    } catch {
      if (attempt === 79) throw new Error("PostgreSQL did not become SQL-ready");
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  psql(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin;
    create table public.recommendation_evaluation_charters (
      id uuid primary key,
      owner_user_id uuid not null,
      segment_key text not null,
      charter_fingerprint text not null,
      policy_attribution jsonb not null,
      charter_json jsonb not null,
      created_at timestamptz not null
    );
    create table public.recommendation_learning_baseline_freezes (
      id uuid primary key,
      owner_user_id uuid not null,
      segment_key text not null,
      baseline_fingerprint text not null,
      evaluation_charter_fingerprint text,
      evaluation_plan jsonb not null,
      frozen_at timestamptz not null
    );
  `);
  psql(readFileSync(migrationPath, "utf8"));
  psql(`
    insert into public.recommendation_evaluation_charters values (
      '${charterId}', '${owner}', '${segment}', '${charterFingerprint}',
      '{"canonical_evaluation_versions":{"ranking_version":"scanner_candidate_ranking_v1.2"}}',
      '${JSON.stringify({ hypothesis })}'::jsonb,
      '2026-01-01T12:00:00.000Z'
    );
    insert into public.recommendation_learning_baseline_freezes values (
      '${baselineId}', '${owner}', '${segment}', '${baselineFingerprint}',
      '${charterFingerprint}',
      '{"policy_attribution":{"canonical_evaluation_versions":{"ranking_version":"scanner_candidate_ranking_v1.2"}}}',
      '2026-01-01T12:00:00.000Z'
    );

    do $$ begin
      if has_table_privilege('anon', 'public.scanner_clock_prior_shadow_forward_decision_plans', 'select')
         or has_table_privilege('authenticated', 'public.scanner_clock_prior_shadow_forward_decision_results', 'insert')
         or has_table_privilege('service_role', 'public.scanner_clock_prior_shadow_forward_decision_plans', 'select')
         or not has_function_privilege('service_role', 'public.record_scanner_clock_prior_shadow_forward_decision_plan(uuid,text,jsonb,text)', 'execute')
         or has_function_privilege('anon', 'public.record_scanner_clock_prior_shadow_forward_decision_plan(uuid,text,jsonb,text)', 'execute')
      then raise exception 'receipt privilege boundary is not server-RPC-only'; end if;
    end $$;

    set role service_role;
    create temporary table first_plan as
      select * from public.record_scanner_clock_prior_shadow_forward_decision_plan(
        '${owner}', '${planFingerprint}', '${JSON.stringify(plan)}'::jsonb,
        'scanner_clock_prior_shadow_forward_decision_receipt_v1'
      );
    create temporary table repeated_plan as
      select * from public.record_scanner_clock_prior_shadow_forward_decision_plan(
        '${owner}', '${planFingerprint}', '${JSON.stringify(plan)}'::jsonb,
        'scanner_clock_prior_shadow_forward_decision_receipt_v1'
      );
    create temporary table first_result as
      select * from public.record_scanner_clock_prior_shadow_forward_decision_result(
        '${owner}', (select plan_id from first_plan), '${planFingerprint}',
        '${resultFingerprint}', '${JSON.stringify(result)}'::jsonb,
        'scanner_clock_prior_shadow_forward_decision_receipt_v1'
      );
    reset role;

    do $$ begin
      if (select write_status from first_plan) <> 'plan_recorded'
         or (select write_status from repeated_plan) <> 'plan_already_recorded'
         or not (select idempotent from repeated_plan)
         or (select write_status from first_result) <> 'result_recorded'
         or (select count(*) from public.scanner_clock_prior_shadow_forward_decision_plans) <> 1
         or (select count(*) from public.scanner_clock_prior_shadow_forward_decision_results) <> 1
      then raise exception 'durable forward receipt lifecycle did not match contract'; end if;
    end $$;

    do $$ begin
      begin
        update public.scanner_clock_prior_shadow_forward_decision_plans
          set segment_key = 'forged';
        raise exception 'immutable plan update unexpectedly succeeded';
      exception when sqlstate '55000' then null;
      end;
      begin
        delete from public.scanner_clock_prior_shadow_forward_decision_results;
        raise exception 'immutable result delete unexpectedly succeeded';
      exception when sqlstate '55000' then null;
      end;
    end $$;
  `);

  console.log("IF-4 clock-prior forward decision receipt local DB test passed.");
} finally {
  try {
    docker("rm", "-f", container);
  } catch {
    // A failed startup may leave no container to remove.
  }
  rmSync(sqlPath, { force: true });
}
