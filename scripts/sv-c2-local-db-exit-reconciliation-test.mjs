#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const container = `ture-sv-c2-${process.pid}`;
const sqlPath = join(tmpdir(), `ture-sv-c2-${process.pid}.sql`);
const foundationMigrationPaths = [
  "../supabase/migrations/20260709000000_create_historical_candle_storage.sql",
  "../supabase/migrations/20260922001000_sv_c1_internal_paper_entry_lifecycle.sql",
  "../supabase/migrations/20260924195853_sv_c1_internal_paper_foreign_key_indexes.sql",
].map((path) => new URL(path, import.meta.url));
const c2MigrationPath = new URL(
  "../supabase/migrations/20260922023000_sv_c2_internal_paper_exit_reconciliation.sql",
  import.meta.url,
);

const owner = "11111111-1111-4111-8111-111111111111";
const otherOwner = "99999999-9999-4999-8999-999999999999";
const successAccount = "22222222-2222-4222-8222-222222222222";
const lossAccount = "33333333-3333-4333-8333-333333333333";
const rollbackAccount = "44444444-4444-4444-8444-444444444444";
const killedAccount = "55555555-5555-4555-8555-555555555555";

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

function expectPsqlFailure(sql, expectedMessage) {
  let failure = null;
  try {
    psql(sql);
  } catch (error) {
    failure = error;
  }
  if (!failure) {
    throw new Error(`Expected PostgreSQL failure: ${expectedMessage}`);
  }
  const output = `${failure.stdout ?? ""}\n${failure.stderr ?? ""}`;
  if (!output.includes(expectedMessage)) {
    throw new Error(
      `PostgreSQL failed without expected message ${expectedMessage}: ${output}`,
    );
  }
}

const decisionPayload = JSON.stringify({
  candidate_decision_record: {
    record_version: "candidate_decision_record_v3",
    scan_run_id: "scan-1",
    scan_run_fingerprint: "scan-fingerprint-1",
    decision_timestamp: "2026-09-21T14:32:00.000Z",
    coverage: { full_membership_captured: true },
    strategy_reference: {
      strategy_id: "intraday_long_multi_setup_quality_ranker",
      strategy_version: "1.0.0",
      rollback_identity: "intraday_long_multi_setup_quality_ranker@1.0.0",
      symbol_selection: {
        policy_id: "rotating_scanner_universe",
        policy_version: "scanner_universe_selection_v1",
        observed_universe_version: "scanner_universe_v1",
      },
    },
    final_decision: { disposition: "recommendations_published" },
    candidates: [
      {
        candidate_id: "scanner_candidate:v1:scan-1:AAPL",
        ticker: "AAPL",
        disposition: "published",
        eligibility: "eligible",
        ranking: { selected: true },
        build: { built: true },
        data: {
          freshness: "fresh",
          provider_source: "twelve_data",
          source_timestamp: "2026-09-21T14:31:00.000Z",
        },
      },
    ],
  },
  decision_lineage_receipt: { status: "reconstructable" },
});

function entryCall(account) {
  return `public.app_apply_internal_paper_entry_v1(
    '${owner}', '${account}', 'scan-1', 'scan-fingerprint-1',
    'snapshot-1', 'snapshot-fingerprint-1',
    'scanner_candidate:v1:scan-1:AAPL',
    'intraday_long_multi_setup_quality_ranker', '1.0.0',
    'intraday_long_multi_setup_quality_ranker@1.0.0',
    'rotating_scanner_universe', 'scanner_universe_selection_v1',
    'scanner_universe_v1', 'AAPL', 10, 100, 95, 112,
    '2026-09-21T14:32:00.000Z',
    'internal_paper_immediate_costed_fill_v1',
    'internal_paper_entry_command_v1'
  )`;
}

function exitCall(account, candle) {
  return `public.app_apply_internal_paper_exit_v1(
    '${owner}', '${account}',
    (select position_id from public.sv_c2_test_positions where account_id = '${account}'),
    '${candle}', 'internal_paper_immediate_costed_exit_v1',
    'internal_paper_durable_candle_evidence_v1',
    'internal_paper_exit_command_v1'
  )`;
}

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
        "-h",
        "127.0.0.1",
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
    create schema auth;
    create schema extensions;
    create extension if not exists pgcrypto with schema extensions;
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
    insert into auth.users(id) values ('${owner}'), ('${otherOwner}');
  `);
  for (const migrationPath of foundationMigrationPaths) {
    psql(readFileSync(migrationPath, "utf8"));
  }

  psql(`
    insert into public.internal_paper_accounts(
      id, owner_user_id, account_key, status, strategy_id, strategy_version,
      strategy_rollback_identity, symbol_selection_policy_id,
      symbol_selection_policy_version, observed_universe_version,
      eligible_symbols, config_version, fill_model_version, starting_cash,
      cash_balance, per_trade_risk_cap, daily_loss_cap, spread_bps,
      slippage_bps, commission_per_order
    ) values (
      'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', '${owner}', 'c2-guard-probe',
      'ready', 'intraday_long_multi_setup_quality_ranker', '1.0.0',
      'intraday_long_multi_setup_quality_ranker@1.0.0',
      'rotating_scanner_universe', 'scanner_universe_selection_v1',
      'scanner_universe_v1', array['AAPL'], 'pilot-config-v1',
      'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
      10, 5, 1
    );
  `);
  expectPsqlFailure(
    readFileSync(c2MigrationPath, "utf8"),
    "sv_c2_requires_empty_c1_state",
  );
  psql(`
    do $$ begin
      if to_regclass('public.internal_paper_exit_intents') is not null
        or exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'internal_paper_accounts'
            and column_name = 'exit_fill_model_version'
        )
        or to_regprocedure('public.app_apply_internal_paper_exit_v1(uuid,uuid,uuid,uuid,text,text,text)') is not null
      then raise exception 'failed C2 admission changed schema'; end if;
    end $$;
    delete from public.internal_paper_accounts
    where id = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
  `);

  psql(`
    alter table public.internal_paper_ledger_entries
      drop constraint internal_paper_ledger_entries_amount_check,
      add constraint internal_paper_ledger_entries_amount_check
        check (amount >= 0);
  `);
  expectPsqlFailure(
    readFileSync(c2MigrationPath, "utf8"),
    "sv_c2_unexpected_c1_ledger_contract",
  );
  psql(`
    do $$ begin
      if to_regclass('public.internal_paper_exit_intents') is not null
        or exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'internal_paper_accounts'
            and column_name = 'exit_fill_model_version'
        )
      then raise exception 'constraint drift admission changed schema'; end if;
    end $$;
    alter table public.internal_paper_ledger_entries
      drop constraint internal_paper_ledger_entries_amount_check,
      add constraint internal_paper_ledger_entries_amount_check
        check (amount <> 0);
  `);

  psql(`
    alter table public.internal_paper_ledger_entries
      alter column intent_id drop not null;
  `);
  expectPsqlFailure(
    readFileSync(c2MigrationPath, "utf8"),
    "sv_c2_unexpected_c1_ledger_contract",
  );
  psql(`
    do $$ begin
      if to_regclass('public.internal_paper_exit_intents') is not null
        or exists (
          select 1
          from information_schema.columns
          where table_schema = 'public'
            and table_name = 'internal_paper_accounts'
            and column_name = 'exit_fill_model_version'
        )
      then raise exception 'nullability drift admission changed schema'; end if;
    end $$;
    alter table public.internal_paper_ledger_entries
      alter column intent_id set not null;
  `);
  psql(readFileSync(c2MigrationPath, "utf8"));

  psql(`
    insert into public.recommendation_scan_runs(
      id, run_fingerprint, trading_date, owner_user_id, payload_json
    ) values (
      'scan-1', 'scan-fingerprint-1', '2026-09-21', '${owner}',
      '${decisionPayload}'::jsonb
    );
    insert into public.recommendation_snapshots(
      id, snapshot_fingerprint, scan_run_id, ticker, status, source_mode,
      data_mode, recommended_at, entry, stop, target, owner_user_id
    ) values (
      'snapshot-1', 'snapshot-fingerprint-1', 'scan-fingerprint-1', 'AAPL',
      'visible', 'supabase', 'live', '2026-09-21T14:32:00.000Z',
      100, 95, 112, '${owner}'
    );
    insert into public.internal_paper_accounts(
      id, owner_user_id, account_key, status, strategy_id, strategy_version,
      strategy_rollback_identity, symbol_selection_policy_id,
      symbol_selection_policy_version, observed_universe_version,
      eligible_symbols, config_version, fill_model_version, starting_cash,
      cash_balance, per_trade_risk_cap, daily_loss_cap, spread_bps,
      slippage_bps, commission_per_order
    ) values
      ('${successAccount}', '${owner}', 'success', 'ready',
       'intraday_long_multi_setup_quality_ranker', '1.0.0',
       'intraday_long_multi_setup_quality_ranker@1.0.0',
       'rotating_scanner_universe', 'scanner_universe_selection_v1',
       'scanner_universe_v1', array['AAPL'], 'pilot-config-v1',
       'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
       10, 5, 1),
      ('${lossAccount}', '${owner}', 'loss', 'ready',
       'intraday_long_multi_setup_quality_ranker', '1.0.0',
       'intraday_long_multi_setup_quality_ranker@1.0.0',
       'rotating_scanner_universe', 'scanner_universe_selection_v1',
       'scanner_universe_v1', array['AAPL'], 'pilot-config-v1',
       'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 50,
       10, 5, 1),
      ('${rollbackAccount}', '${owner}', 'rollback', 'ready',
       'intraday_long_multi_setup_quality_ranker', '1.0.0',
       'intraday_long_multi_setup_quality_ranker@1.0.0',
       'rotating_scanner_universe', 'scanner_universe_selection_v1',
       'scanner_universe_v1', array['AAPL'], 'pilot-config-v1',
       'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
       10, 5, 1),
      ('${killedAccount}', '${owner}', 'killed-after-entry', 'ready',
       'intraday_long_multi_setup_quality_ranker', '1.0.0',
       'intraday_long_multi_setup_quality_ranker@1.0.0',
       'rotating_scanner_universe', 'scanner_universe_selection_v1',
       'scanner_universe_v1', array['AAPL'], 'pilot-config-v1',
       'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
       10, 5, 1);

    create table public.sv_c2_test_positions (
      account_id uuid primary key,
      position_id uuid not null unique
    );
    grant select, insert on public.sv_c2_test_positions to service_role;
    set role service_role;
    insert into public.sv_c2_test_positions
      select '${successAccount}', position_id from ${entryCall(successAccount)};
    insert into public.sv_c2_test_positions
      select '${lossAccount}', position_id from ${entryCall(lossAccount)};
    insert into public.sv_c2_test_positions
      select '${rollbackAccount}', position_id from ${entryCall(rollbackAccount)};
    insert into public.sv_c2_test_positions
      select '${killedAccount}', position_id from ${entryCall(killedAccount)};
    reset role;
    update public.internal_paper_accounts set status = 'killed'
    where id = '${killedAccount}';

    insert into public.historical_candle_fetch_runs(
      id, provider, request_type, ticker_count, candle_count, interval,
      trading_day_start, trading_day_end, requested_at, completed_at, status,
      provider_credits_used
    ) values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'twelve_data', 'time_series',
      1, 6, '1min', '2026-09-21', '2026-09-21',
      '2026-09-21T14:59:59Z', '2026-09-21T20:00:05Z', 'completed', 1
    );
    insert into public.historical_candles(
      id, provider, ticker, interval, "timestamp", trading_day, "session",
      timezone, open, high, low, close, adjusted, source, cache_key,
      provider_request_id, fetch_run_id, validation_status
    ) values
      ('aaaaaaaa-0000-4000-8000-000000000001', 'twelve_data', 'AAPL', '1min',
       '2026-09-21T15:00:00Z', '2026-09-21', 'regular', 'America/New_York',
       111, 113, 110, 112, true, 'twelve_data', 'target', 'request-target',
       'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'valid'),
      ('aaaaaaaa-0000-4000-8000-000000000002', 'twelve_data', 'AAPL', '1min',
       '2026-09-21T19:59:00Z', '2026-09-21', 'regular', 'America/New_York',
       105, 106, 104, 105, true, 'twelve_data', 'eod', 'request-eod',
       'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'valid'),
      ('aaaaaaaa-0000-4000-8000-000000000003', 'twelve_data', 'AAPL', '1min',
       '2026-09-21T16:00:00Z', '2026-09-21', 'regular', 'America/New_York',
       94, 113, 93, 110, true, 'twelve_data', 'stop', 'request-stop',
       'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'valid'),
      ('aaaaaaaa-0000-4000-8000-000000000004', 'twelve_data', 'AAPL', '1min',
       '2026-09-21T16:01:00Z', '2026-09-21', 'regular', 'America/New_York',
       105, 106, 104, 105, true, 'twelve_data', 'none', 'request-none',
       'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'valid'),
      ('aaaaaaaa-0000-4000-8000-000000000005', 'twelve_data', 'AAPL', '1min',
       '2026-09-21T16:02:00Z', '2026-09-21', 'regular', 'America/New_York',
       94, 96, 93, 95, true, 'twelve_data', 'static', 'request-static',
       'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'validated_static_payload'),
      ('aaaaaaaa-0000-4000-8000-000000000006', 'twelve_data', 'AAPL', '1min',
       '2026-09-21T16:03:00Z', '2026-09-21', 'regular', 'America/New_York',
       94, 96, 93, 95, true, 'twelve_data', 'rollback', 'request-rollback',
       'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'valid');
  `);

  // Kill blocks new entries but never strands an existing position.
  psql(`
    set role service_role;
    select * from ${exitCall(killedAccount, "aaaaaaaa-0000-4000-8000-000000000003")};
    reset role;
    do $$ begin
      if (select status from public.internal_paper_accounts where id = '${killedAccount}') <> 'killed'
        or (select status from public.internal_paper_positions where account_id = '${killedAccount}') <> 'closed'
        or (select count(*) from public.internal_paper_exit_fills where account_id = '${killedAccount}') <> 1
      then raise exception 'killed account could not reduce existing paper risk'; end if;
    end $$;
  `);

  // Partial target, then exact retry from a new database session.
  psql(`
    create table public.sv_c2_receipts as
      select * from ${exitCall(successAccount, "aaaaaaaa-0000-4000-8000-000000000001")}
      with no data;
    grant insert, select on public.sv_c2_receipts to service_role;
    set role service_role;
    insert into public.sv_c2_receipts
      select * from ${exitCall(successAccount, "aaaaaaaa-0000-4000-8000-000000000001")};
    reset role;
    do $$ begin
      if (select disposition from public.sv_c2_receipts limit 1) <> 'created'
        or (select exit_reason from public.sv_c2_receipts limit 1) <> 'target_partial'
        or (select quantity from public.sv_c2_receipts limit 1) <> 5
        or (select remaining_quantity from public.sv_c2_receipts limit 1) <> 5
        or (select fill_price from public.sv_c2_receipts limit 1) <> 111.888000
        or (select net_cash_proceeds from public.sv_c2_receipts limit 1) <> 558.440000
        or (select realized_net_pnl from public.sv_c2_receipts limit 1) <> 57.440000
        or (select cash_balance from public.internal_paper_accounts where id = '${successAccount}') <> 99556.440000
        or (select state_version from public.internal_paper_accounts where id = '${successAccount}') <> 2
        or (select remaining_cost_basis from public.internal_paper_positions where account_id = '${successAccount}') <> 500.500000
        or (select remaining_entry_commission from public.internal_paper_positions where account_id = '${successAccount}') <> 0.500000
        or (select count(*) from public.internal_paper_ledger_entries where account_id = '${successAccount}') <> 7
        or (select sum(amount) from public.internal_paper_ledger_entries where account_id = '${successAccount}') <> 0
        or (select candle_evidence ->> 'provider' from public.internal_paper_exit_intents where account_id = '${successAccount}') <> 'twelve_data'
        or (select candle_evidence_digest from public.internal_paper_exit_intents where account_id = '${successAccount}') <>
          (select encode(extensions.digest(convert_to(candle_evidence::text, 'UTF8'), 'sha256'), 'hex') from public.internal_paper_exit_intents where account_id = '${successAccount}')
      then raise exception 'partial target did not reconcile'; end if;
    end $$;
  `);

  psql(`
    set role service_role;
    insert into public.sv_c2_receipts
      select * from ${exitCall(successAccount, "aaaaaaaa-0000-4000-8000-000000000001")};
    reset role;
    do $$ begin
      if (select disposition from public.sv_c2_receipts offset 1 limit 1) <> 'reused'
        or (select count(distinct intent_id) from public.sv_c2_receipts) <> 1
        or (select count(distinct fill_id) from public.sv_c2_receipts) <> 1
        or (select count(*) from public.internal_paper_exit_fills where account_id = '${successAccount}') <> 1
        or (select state_version from public.internal_paper_accounts where id = '${successAccount}') <> 2
      then raise exception 'exit retry created a duplicate effect'; end if;
    end $$;
  `);

  // The 15:59 New York candle closes the residue and preserves exact pennies.
  psql(`
    set role service_role;
    select * from ${exitCall(successAccount, "aaaaaaaa-0000-4000-8000-000000000002")};
    reset role;
    do $$ declare readback jsonb; begin
      readback := public.app_read_internal_paper_account_v2(
        '${owner}', '${successAccount}', 'internal_paper_readback_v2'
      );
      if (select status from public.internal_paper_positions where account_id = '${successAccount}') <> 'closed'
        or (select remaining_quantity from public.internal_paper_positions where account_id = '${successAccount}') <> 0
        or (select cash_balance from public.internal_paper_accounts where id = '${successAccount}') <> 100079.915000
        or (select realized_gross_pnl from public.internal_paper_accounts where id = '${successAccount}') <> 82.915000
        or (select realized_net_pnl from public.internal_paper_accounts where id = '${successAccount}') <> 79.915000
        or (select total_commission_paid from public.internal_paper_accounts where id = '${successAccount}') <> 3.000000
        or (readback ->> 'ledger_entry_count')::integer <> 11
        or (readback ->> 'ledger_balance')::numeric <> 0
      then raise exception 'final EOD exit did not reconcile'; end if;
    end $$;
  `);

  // A bar touching stop and target uses stop-first and trips the daily loss cap.
  psql(`
    set role service_role;
    select * from ${exitCall(lossAccount, "aaaaaaaa-0000-4000-8000-000000000003")};
    reset role;
    do $$ begin
      if (select exit_reason from public.internal_paper_exit_intents where account_id = '${lossAccount}') <> 'stop_loss'
        or (select quantity from public.internal_paper_exit_fills where account_id = '${lossAccount}') <> 10
        or (select fill_price from public.internal_paper_exit_fills where account_id = '${lossAccount}') <> 93.906000
        or (select net_pnl from public.internal_paper_exit_fills where account_id = '${lossAccount}') <> -63.940000
        or (select status from public.internal_paper_accounts where id = '${lossAccount}') <> 'paused'
        or (select cash_balance from public.internal_paper_accounts where id = '${lossAccount}') <> 99936.060000
      then raise exception 'conservative stop or loss pause failed'; end if;
    end $$;
  `);

  // No trigger, static evidence and cross-owner access all fail without writes.
  psql(`
    do $$ begin
      begin
        set local role service_role;
        perform ${exitCall(rollbackAccount, "aaaaaaaa-0000-4000-8000-000000000004")};
        raise exception 'expected no-trigger rejection';
      exception when others then
        if sqlerrm = 'expected no-trigger rejection' then raise; end if;
        if sqlerrm <> 'internal_paper_exit_not_triggered' then raise; end if;
      end;
    end $$;
    do $$ begin
      begin
        set local role service_role;
        perform ${exitCall(rollbackAccount, "aaaaaaaa-0000-4000-8000-000000000005")};
        raise exception 'expected static-evidence rejection';
      exception when others then
        if sqlerrm = 'expected static-evidence rejection' then raise; end if;
        if sqlerrm <> 'internal_paper_exit_candle_not_eligible' then raise; end if;
      end;
    end $$;
    do $$ begin
      begin
        set local role service_role;
        perform public.app_apply_internal_paper_exit_v1(
          '${otherOwner}', '${rollbackAccount}',
          (select position_id from public.sv_c2_test_positions where account_id = '${rollbackAccount}'),
          'aaaaaaaa-0000-4000-8000-000000000006',
          'internal_paper_immediate_costed_exit_v1',
          'internal_paper_durable_candle_evidence_v1',
          'internal_paper_exit_command_v1'
        );
        raise exception 'expected owner rejection';
      exception when others then
        if sqlerrm = 'expected owner rejection' then raise; end if;
        if sqlerrm <> 'internal_paper_account_not_found' then raise; end if;
      end;
    end $$;
    do $$ begin
      begin
        set local role anon;
        perform ${exitCall(rollbackAccount, "aaaaaaaa-0000-4000-8000-000000000006")};
        raise exception 'anon unexpectedly executed exit';
      exception when insufficient_privilege then null;
      end;
    end $$;
  `);

  // A late ledger failure must roll back intent, fill, position and account.
  psql(`
    create function public.sv_c2_force_ledger_failure() returns trigger
    language plpgsql as $$ begin
      if new.account_id = '${rollbackAccount}'::uuid
        and new.entry_type = 'paper_exit_fill'
      then raise exception 'forced exit ledger failure'; end if;
      return new;
    end $$;
    create trigger sv_c2_force_ledger_failure
      before insert on public.internal_paper_ledger_entries
      for each row execute function public.sv_c2_force_ledger_failure();
    do $$ begin
      begin
        set local role service_role;
        perform ${exitCall(rollbackAccount, "aaaaaaaa-0000-4000-8000-000000000006")};
        raise exception 'expected forced failure';
      exception when others then
        if sqlerrm = 'expected forced failure' then raise; end if;
        if sqlerrm <> 'forced exit ledger failure' then raise; end if;
      end;
    end $$;
    do $$ begin
      if (select count(*) from public.internal_paper_exit_intents where account_id = '${rollbackAccount}') <> 0
        or (select count(*) from public.internal_paper_exit_fills where account_id = '${rollbackAccount}') <> 0
        or (select status from public.internal_paper_positions where account_id = '${rollbackAccount}') <> 'open'
        or (select remaining_quantity from public.internal_paper_positions where account_id = '${rollbackAccount}') <> 10
        or (select cash_balance from public.internal_paper_accounts where id = '${rollbackAccount}') <> 98998.000000
        or (select state_version from public.internal_paper_accounts where id = '${rollbackAccount}') <> 1
        or (select count(*) from public.internal_paper_ledger_entries where account_id = '${rollbackAccount}') <> 3
      then raise exception 'failed exit was not fully rolled back'; end if;
    end $$;
  `);

  console.log(
    "SV-C2 PostgreSQL empty-state guard, partial/final/stop exit, restart, reconciliation, isolation and rollback tests passed.",
  );
} finally {
  try {
    docker("rm", "-f", container);
  } catch {}
  rmSync(sqlPath, { force: true });
}
