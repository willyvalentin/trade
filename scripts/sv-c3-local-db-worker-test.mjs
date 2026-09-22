#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const container = `ture-sv-c3-${process.pid}`;
const sqlPath = join(tmpdir(), `ture-sv-c3-${process.pid}.sql`);
const migrations = [
  "../supabase/migrations/20260709000000_create_historical_candle_storage.sql",
  "../supabase/migrations/20260922001000_sv_c1_internal_paper_entry_lifecycle.sql",
  "../supabase/migrations/20260922023000_sv_c2_internal_paper_exit_reconciliation.sql",
  "../supabase/migrations/20260922045917_sv_c3_durable_internal_paper_worker.sql",
].map((path) => new URL(path, import.meta.url));

const owner = "11111111-1111-4111-8111-111111111111";
const account = "22222222-2222-4222-8222-222222222222";

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
    "exec", "-e", "PGPASSWORD=postgres", container, "psql",
    "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres",
    "-f", "/tmp/test.sql",
  );
}

const publishedDecision = {
  candidate_decision_record: {
    record_version: "candidate_decision_record_v3",
    scan_run_id: "scan-entry",
    scan_run_fingerprint: "scan-entry-fingerprint",
    decision_timestamp: "2026-09-22T14:31:00.000Z",
    coverage: { full_membership_captured: true },
    strategy_reference: {
      strategy_id: "pilot-strategy",
      strategy_version: "1.0.0",
      rollback_identity: "pilot-strategy@1.0.0",
      symbol_selection: {
        policy_id: "pilot-symbols",
        policy_version: "1.0.0",
        observed_universe_version: "pilot-universe-v1",
      },
    },
    final_decision: { disposition: "recommendations_published" },
    candidates: [{
      candidate_id: "candidate:AAPL",
      ticker: "AAPL",
      disposition: "published",
      eligibility: "eligible",
      ranking: { selected: true },
      build: { built: true },
      data: {
        freshness: "fresh",
        provider_source: "twelve_data",
        source_timestamp: "2026-09-22T14:30:00.000Z",
      },
    }],
  },
  decision_lineage_receipt: { status: "reconstructable" },
};

const noTradeDecision = {
  candidate_decision_record: {
    record_version: "candidate_decision_record_v3",
    scan_run_id: "scan-no-trade",
    scan_run_fingerprint: "scan-no-trade-fingerprint",
    final_decision: {
      disposition: "no_trade",
      no_trade_reason: "below_publish_threshold",
    },
  },
};

const retryNoTradeDecision = {
  candidate_decision_record: {
    record_version: "candidate_decision_record_v3",
    scan_run_id: "scan-retry",
    scan_run_fingerprint: "scan-retry-fingerprint",
    final_decision: {
      disposition: "no_trade",
      no_trade_reason: "insufficient_coverage",
    },
  },
};

const entryPayload = {
  command_version: "internal_paper_entry_command_v1",
  fill_model_version: "internal_paper_immediate_costed_fill_v1",
  owner_user_id: owner,
  account_id: account,
  scan_run_id: "scan-entry",
  scan_run_fingerprint: "scan-entry-fingerprint",
  snapshot_id: "snapshot-entry",
  snapshot_fingerprint: "snapshot-entry-fingerprint",
  candidate_identity: "candidate:AAPL",
  strategy_id: "pilot-strategy",
  strategy_version: "1.0.0",
  strategy_rollback_identity: "pilot-strategy@1.0.0",
  symbol_selection_policy_id: "pilot-symbols",
  symbol_selection_policy_version: "1.0.0",
  observed_universe_version: "pilot-universe-v1",
  ticker: "AAPL",
  quantity: 10,
  arrival_price: 100,
  stop_price: 95,
  target_price: 112,
  submitted_at: "2026-09-22T14:31:00.000Z",
};

const noTradePayload = {
  record_version: "candidate_decision_record_v3",
  disposition: "no_trade",
  owner_user_id: owner,
  account_id: account,
  scan_run_id: "scan-no-trade",
  scan_run_fingerprint: "scan-no-trade-fingerprint",
  no_trade_reason: "below_publish_threshold",
};

try {
  docker("run", "--rm", "-d", "--name", container, "-e", "POSTGRES_PASSWORD=postgres", "postgres:16-alpine");
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      docker("exec", "-e", "PGPASSWORD=postgres", container, "psql", "-h", "127.0.0.1", "-U", "postgres", "-d", "postgres", "-c", "select 1");
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
    create schema auth;
    create schema extensions;
    create extension pgcrypto with schema extensions;
    create table auth.users (id uuid primary key);
    create table public.recommendation_scan_runs (
      id text primary key,
      run_fingerprint text not null unique,
      trading_date date,
      owner_user_id uuid,
      payload_json jsonb not null default '{}'::jsonb
    );
    create table public.recommendation_snapshots (
      id text primary key,
      snapshot_fingerprint text not null unique,
      scan_run_id text,
      ticker text,
      status text not null default 'visible',
      source_mode text not null default 'unknown',
      data_mode text not null default 'unknown',
      recommended_at timestamptz not null,
      entry numeric,
      stop numeric,
      target numeric,
      owner_user_id uuid
    );
    insert into auth.users(id) values ('${owner}');
  `);
  for (const migration of migrations) psql(readFileSync(migration, "utf8"));

  psql(`
    insert into public.recommendation_scan_runs(
      id, run_fingerprint, trading_date, owner_user_id, payload_json
    ) values
      ('scan-entry', 'scan-entry-fingerprint', '2026-09-22', '${owner}', '${JSON.stringify(publishedDecision)}'),
      ('scan-no-trade', 'scan-no-trade-fingerprint', '2026-09-22', '${owner}', '${JSON.stringify(noTradeDecision)}'),
      ('scan-retry', 'scan-retry-fingerprint', '2026-09-22', '${owner}', '${JSON.stringify(retryNoTradeDecision)}');
    insert into public.recommendation_snapshots(
      id, snapshot_fingerprint, scan_run_id, ticker, status, source_mode,
      data_mode, recommended_at, entry, stop, target, owner_user_id
    ) values (
      'snapshot-entry', 'snapshot-entry-fingerprint', 'scan-entry-fingerprint',
      'AAPL', 'visible', 'supabase', 'live', '2026-09-22T14:31:00Z',
      100, 95, 112, '${owner}'
    );
    insert into public.internal_paper_accounts(
      id, owner_user_id, account_key, status, strategy_id, strategy_version,
      strategy_rollback_identity, symbol_selection_policy_id,
      symbol_selection_policy_version, observed_universe_version,
      eligible_symbols, config_version, fill_model_version, starting_cash,
      cash_balance, per_trade_risk_cap, daily_loss_cap, spread_bps,
      slippage_bps, commission_per_order
    ) values (
      '${account}', '${owner}', 'pilot', 'ready', 'pilot-strategy', '1.0.0',
      'pilot-strategy@1.0.0', 'pilot-symbols', '1.0.0',
      'pilot-universe-v1', array['AAPL'], 'pilot-config-v1',
      'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
      10, 5, 1
    );
  `);

  // Idempotent enqueue plus account-serial claim.
  psql(`
    set role service_role;
    create temporary table enqueue_receipts as
      select public.app_enqueue_internal_paper_worker_job_v1(
        '${owner}', '${account}', 'entry', '${JSON.stringify(entryPayload)}',
        'internal_paper_worker_job_v1'
      ) receipt;
    insert into enqueue_receipts
      select public.app_enqueue_internal_paper_worker_job_v1(
        '${owner}', '${account}', 'entry', '${JSON.stringify(entryPayload)}',
        'internal_paper_worker_job_v1'
      );
    select public.app_enqueue_internal_paper_worker_job_v1(
      '${owner}', '${account}', 'no_trade', '${JSON.stringify(noTradePayload)}',
      'internal_paper_worker_job_v1'
    );
    create temporary table claim_one as
      select public.app_claim_internal_paper_worker_job_v1(
        'worker-one', '2026-09-22T14:31:05Z', 60,
        'internal_paper_worker_job_v1'
      ) receipt;
    create temporary table claim_blocked as
      select public.app_claim_internal_paper_worker_job_v1(
        'worker-two', '2026-09-22T14:31:06Z', 60,
        'internal_paper_worker_job_v1'
      ) receipt;
    do $$ begin
      if (select receipt ->> 'disposition' from enqueue_receipts limit 1) <> 'created'
        or (select receipt ->> 'disposition' from enqueue_receipts offset 1 limit 1) <> 'reused'
        or (select receipt ->> 'work_kind' from claim_one) <> 'entry'
        or (select receipt ->> 'status' from claim_blocked) <> 'no_work'
      then raise exception 'enqueue or account-serial claim invariant failed'; end if;
    end $$;
    select public.app_execute_internal_paper_worker_job_v1(
      ((select receipt ->> 'job_id' from claim_one))::uuid,
      ((select receipt ->> 'lease_token' from claim_one))::uuid,
      '2026-09-22T14:31:07Z', 'internal_paper_worker_job_v1'
    );
    reset role;
    do $$ begin
      if (select count(*) from public.internal_paper_entry_intents where account_id = '${account}') <> 1
        or (select count(*) from public.internal_paper_positions where account_id = '${account}' and status = 'open') <> 1
        or (select status from public.internal_paper_worker_jobs where work_kind = 'entry') <> 'completed'
      then raise exception 'entry worker did not commit one atomic economic effect'; end if;
    end $$;
  `);

  // Exit jobs have priority and execute through the C2 boundary.
  psql(`
    insert into public.historical_candle_fetch_runs(
      id, provider, request_type, ticker_count, candle_count, interval,
      trading_day_start, trading_day_end, requested_at, completed_at, status,
      provider_credits_used
    ) values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'twelve_data', 'time_series',
      1, 1, '1min', '2026-09-22', '2026-09-22',
      '2026-09-22T15:00:00Z', '2026-09-22T15:00:03Z', 'completed', 1
    );
    insert into public.historical_candles(
      id, provider, ticker, interval, "timestamp", trading_day, "session",
      timezone, open, high, low, close, adjusted, source, cache_key,
      provider_request_id, fetch_run_id, validation_status
    ) values (
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'twelve_data', 'AAPL', '1min',
      '2026-09-22T15:00:00Z', '2026-09-22', 'regular', 'America/New_York',
      94, 96, 93, 95, true, 'twelve_data', 'worker-stop', 'worker-stop-request',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'valid'
    );
    set role service_role;
    select public.app_enqueue_internal_paper_worker_job_v1(
      '${owner}', '${account}', 'exit', jsonb_build_object(
        'command_version', 'internal_paper_exit_command_v1',
        'fill_model_version', 'internal_paper_immediate_costed_exit_v1',
        'evidence_version', 'internal_paper_durable_candle_evidence_v1',
        'owner_user_id', '${owner}', 'account_id', '${account}',
        'position_id', public.app_read_internal_paper_account_v2(
          '${owner}', '${account}', 'internal_paper_readback_v2'
        ) #>> '{positions,0,id}',
        'candle_id', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
      ), 'internal_paper_worker_job_v1'
    );
    create temporary table exit_claim as
      select public.app_claim_internal_paper_worker_job_v1(
        'worker-exit', '2026-09-22T15:00:04Z', 60,
        'internal_paper_worker_job_v1'
      ) receipt;
    do $$ begin
      if (select receipt ->> 'work_kind' from exit_claim) <> 'exit'
      then raise exception 'exit did not take priority over no-trade'; end if;
    end $$;
    select public.app_execute_internal_paper_worker_job_v1(
      ((select receipt ->> 'job_id' from exit_claim))::uuid,
      ((select receipt ->> 'lease_token' from exit_claim))::uuid,
      '2026-09-22T15:00:05Z', 'internal_paper_worker_job_v1'
    );
    reset role;
    do $$ begin
      if (select status from public.internal_paper_positions where account_id = '${account}') <> 'closed'
        or (select count(*) from public.internal_paper_exit_intents where account_id = '${account}') <> 1
      then raise exception 'exit worker did not reconcile C2 effect'; end if;
    end $$;
  `);

  // Expired leases are reclaimed; the retained no-trade produces zero economics.
  psql(`
    set role service_role;
    create temporary table stale_claim as
      select public.app_claim_internal_paper_worker_job_v1(
        'worker-stale', '2026-09-22T15:01:00Z', 15,
        'internal_paper_worker_job_v1'
      ) receipt;
    create temporary table reclaimed_claim as
      select public.app_claim_internal_paper_worker_job_v1(
        'worker-restart', '2026-09-22T15:01:16Z', 60,
        'internal_paper_worker_job_v1'
      ) receipt;
    do $$ begin
      if (select receipt ->> 'status' from reclaimed_claim) <> 'claimed'
        or (select receipt ->> 'work_kind' from reclaimed_claim) <> 'no_trade'
        or (select receipt ->> 'lease_token' from stale_claim)
          = (select receipt ->> 'lease_token' from reclaimed_claim)
        or (select receipt ->> 'attempt_count' from reclaimed_claim)::integer <> 2
      then raise exception 'expired lease was not safely reclaimed'; end if;
    end $$;
    select public.app_execute_internal_paper_worker_job_v1(
      ((select receipt ->> 'job_id' from reclaimed_claim))::uuid,
      ((select receipt ->> 'lease_token' from reclaimed_claim))::uuid,
      '2026-09-22T15:01:17Z', 'internal_paper_worker_job_v1'
    );
    reset role;
    do $$ declare readback jsonb; begin
      readback := public.app_read_internal_paper_worker_v1(
        '${owner}', '${account}', 'internal_paper_worker_readback_v1'
      );
      if (readback ->> 'no_trade_count')::integer <> 1
        or (select count(*) from public.internal_paper_entry_intents where account_id = '${account}') <> 1
        or (select count(*) from public.internal_paper_exit_intents where account_id = '${account}') <> 1
        or (select count(*) from public.internal_paper_worker_jobs where status = 'leased') <> 0
      then raise exception 'no-trade terminal receipt or readback failed'; end if;
    end $$;
  `);

  // Failed attempts release their lease, respect backoff and block at budget.
  psql(`
    set role service_role;
    select public.app_enqueue_internal_paper_worker_job_v1(
      '${owner}', '${account}', 'no_trade', jsonb_build_object(
        'record_version', 'candidate_decision_record_v3',
        'disposition', 'no_trade', 'owner_user_id', '${owner}',
        'account_id', '${account}', 'scan_run_id', 'scan-retry',
        'scan_run_fingerprint', 'scan-retry-fingerprint',
        'no_trade_reason', 'insufficient_coverage'
      ), 'internal_paper_worker_job_v1'
    );
    reset role;
    update public.internal_paper_worker_jobs
      set max_attempts = 2 where payload ->> 'scan_run_id' = 'scan-retry';
    set role service_role;
    create temporary table retry_claim_one as
      select public.app_claim_internal_paper_worker_job_v1(
        'worker-retry-one', '2026-09-22T15:02:00Z', 60,
        'internal_paper_worker_job_v1'
      ) receipt;
    select public.app_release_internal_paper_worker_job_v1(
      ((select receipt ->> 'job_id' from retry_claim_one))::uuid,
      ((select receipt ->> 'lease_token' from retry_claim_one))::uuid,
      '2026-09-22T15:02:01Z', '2026-09-22T15:02:31Z',
      'worker_execution_failed', 'internal_paper_worker_job_v1'
    );
    create temporary table before_backoff as
      select public.app_claim_internal_paper_worker_job_v1(
        'worker-too-early', '2026-09-22T15:02:30Z', 60,
        'internal_paper_worker_job_v1'
      ) receipt;
    create temporary table retry_claim_two as
      select public.app_claim_internal_paper_worker_job_v1(
        'worker-retry-two', '2026-09-22T15:02:31Z', 60,
        'internal_paper_worker_job_v1'
      ) receipt;
    create temporary table blocked_receipt as
      select public.app_release_internal_paper_worker_job_v1(
        ((select receipt ->> 'job_id' from retry_claim_two))::uuid,
        ((select receipt ->> 'lease_token' from retry_claim_two))::uuid,
        '2026-09-22T15:02:32Z', '2026-09-22T15:03:02Z',
        'worker_execution_failed', 'internal_paper_worker_job_v1'
      ) receipt;
    reset role;
    do $$ begin
      if (select receipt ->> 'status' from before_backoff) <> 'no_work'
        or (select receipt ->> 'attempt_count' from retry_claim_two)::integer <> 2
        or (select receipt ->> 'status' from blocked_receipt) <> 'blocked'
        or (select status from public.internal_paper_worker_jobs where payload ->> 'scan_run_id' = 'scan-retry') <> 'blocked'
        or (select count(*) from public.internal_paper_worker_jobs where status = 'leased') <> 0
      then raise exception 'retry backoff or terminal block invariant failed'; end if;
    end $$;
  `);

  // Direct browser access and function execution remain denied.
  psql(`
    do $$ begin
      begin
        set local role anon;
        perform count(*) from public.internal_paper_worker_jobs;
        raise exception 'anon unexpectedly read worker jobs';
      exception when insufficient_privilege then null;
      end;
      begin
        set local role authenticated;
        perform public.app_claim_internal_paper_worker_job_v1(
          'browser', now(), 60, 'internal_paper_worker_job_v1'
        );
        raise exception 'authenticated unexpectedly claimed worker work';
      exception when insufficient_privilege then null;
      end;
    end $$;
  `);

  console.log("SV-C3 durable internal-paper worker database proof passed");
} finally {
  try { docker("rm", "-f", container); } catch {}
  rmSync(sqlPath, { force: true });
}
