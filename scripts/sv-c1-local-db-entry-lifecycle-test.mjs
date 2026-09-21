#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const container = `ture-sv-c1-${process.pid}`;
const sqlPath = join(tmpdir(), `ture-sv-c1-${process.pid}.sql`);
const migrationPath = new URL(
  "../supabase/migrations/20260922001000_sv_c1_internal_paper_entry_lifecycle.sql",
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

const migration = readFileSync(migrationPath, "utf8");
const owner = "11111111-1111-4111-8111-111111111111";
const otherOwner = "99999999-9999-4999-8999-999999999999";

const decisionPayload = (disposition = "recommendations_published") =>
  JSON.stringify({
    candidate_decision_record: {
      record_version: "candidate_decision_record_v3",
      scan_run_id: "scan-1",
      scan_run_fingerprint: "scan-fingerprint-1",
      decision_timestamp: "2026-09-21T14:32:00.000Z",
      coverage: { full_membership_captured: true },
      strategy_reference: {
        strategy_id: "intraday_long_multi_setup_quality_ranker",
        strategy_version: "1.0.0",
        rollback_identity:
          "intraday_long_multi_setup_quality_ranker@1.0.0",
        symbol_selection: {
          policy_id: "rotating_scanner_universe",
          policy_version: "scanner_universe_selection_v1",
          observed_universe_version: "scanner_universe_v1",
        },
      },
      final_decision: { disposition },
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

function entryCall({
  account = "22222222-2222-4222-8222-222222222222",
  snapshot = "snapshot-1",
  snapshotFingerprint = "snapshot-fingerprint-1",
  quantity = 10,
  callOwner = owner,
  scan = "scan-1",
  scanFingerprint = "scan-fingerprint-1",
} = {}) {
  return `public.app_apply_internal_paper_entry_v1(
    '${callOwner}', '${account}', '${scan}', '${scanFingerprint}',
    '${snapshot}', '${snapshotFingerprint}', 'scanner_candidate:v1:scan-1:AAPL',
    'intraday_long_multi_setup_quality_ranker', '1.0.0',
    'intraday_long_multi_setup_quality_ranker@1.0.0',
    'rotating_scanner_universe', 'scanner_universe_selection_v1',
    'scanner_universe_v1', 'AAPL', ${quantity}, 100, 95, 112,
    '2026-09-21T14:32:00.000Z',
    'internal_paper_immediate_costed_fill_v1',
    'internal_paper_entry_command_v1'
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
    "postgres:16-alpine",
  );
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      docker(
        "exec",
        "-e",
        "PGPASSWORD=postgres",
        container,
        "pg_isready",
        "-U",
        "postgres",
      );
      break;
    } catch {
      if (attempt === 39) throw new Error("PostgreSQL did not become ready");
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
  psql(migration);

  psql(`
    insert into public.recommendation_scan_runs(
      id, run_fingerprint, trading_date, owner_user_id, payload_json
    ) values (
      'scan-1', 'scan-fingerprint-1', '2026-09-21', '${owner}',
      '${decisionPayload()}'::jsonb
    ), (
      'scan-no-trade', 'scan-no-trade-fingerprint', '2026-09-21', '${owner}',
      jsonb_set(
        jsonb_set(
          '${decisionPayload("explicit_no_trade")}'::jsonb,
          '{candidate_decision_record,scan_run_id}', '"scan-no-trade"'
        ),
        '{candidate_decision_record,scan_run_fingerprint}',
        '"scan-no-trade-fingerprint"'
      )
    );

    insert into public.recommendation_snapshots(
      id, snapshot_fingerprint, scan_run_id, ticker, status, source_mode,
      data_mode, recommended_at, entry, stop, target, owner_user_id
    ) values
      ('snapshot-1', 'snapshot-fingerprint-1', 'scan-fingerprint-1', 'AAPL',
       'visible', 'supabase', 'live', '2026-09-21T14:32:00.000Z', 100, 95, 112, '${owner}'),
      ('snapshot-risk', 'snapshot-fingerprint-risk', 'scan-fingerprint-1', 'AAPL',
       'visible', 'supabase', 'live', '2026-09-21T14:32:00.000Z', 100, 95, 112, '${owner}'),
      ('snapshot-rollback', 'snapshot-fingerprint-rollback', 'scan-fingerprint-1', 'AAPL',
       'visible', 'supabase', 'live', '2026-09-21T14:32:00.000Z', 100, 95, 112, '${owner}'),
      ('snapshot-no-trade', 'snapshot-fingerprint-no-trade', 'scan-no-trade-fingerprint', 'AAPL',
       'visible', 'supabase', 'live', '2026-09-21T14:32:00.000Z', 100, 95, 112, '${owner}');

    insert into public.internal_paper_accounts(
      id, owner_user_id, account_key, status, strategy_id, strategy_version,
      strategy_rollback_identity, symbol_selection_policy_id,
      symbol_selection_policy_version, observed_universe_version,
      eligible_symbols, config_version, fill_model_version, starting_cash,
      cash_balance, per_trade_risk_cap, daily_loss_cap, spread_bps,
      slippage_bps, commission_per_order
    ) values
      ('22222222-2222-4222-8222-222222222222', '${owner}', 'success', 'ready',
       'intraday_long_multi_setup_quality_ranker', '1.0.0',
       'intraday_long_multi_setup_quality_ranker@1.0.0',
       'rotating_scanner_universe', 'scanner_universe_selection_v1',
       'scanner_universe_v1', array['AAPL','MSFT'], 'pilot-config-v1',
       'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
       10, 5, 1),
      ('33333333-3333-4333-8333-333333333333', '${owner}', 'killed', 'killed',
       'intraday_long_multi_setup_quality_ranker', '1.0.0',
       'intraday_long_multi_setup_quality_ranker@1.0.0',
       'rotating_scanner_universe', 'scanner_universe_selection_v1',
       'scanner_universe_v1', array['AAPL'], 'pilot-config-v1',
       'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
       10, 5, 1),
      ('44444444-4444-4444-8444-444444444444', '${owner}', 'risk', 'ready',
       'intraday_long_multi_setup_quality_ranker', '1.0.0',
       'intraday_long_multi_setup_quality_ranker@1.0.0',
       'rotating_scanner_universe', 'scanner_universe_selection_v1',
       'scanner_universe_v1', array['AAPL'], 'pilot-config-v1',
       'internal_paper_immediate_costed_fill_v1', 100000, 100000, 10, 500,
       10, 5, 1),
      ('55555555-5555-4555-8555-555555555555', '${owner}', 'rollback', 'ready',
       'intraday_long_multi_setup_quality_ranker', '1.0.0',
       'intraday_long_multi_setup_quality_ranker@1.0.0',
       'rotating_scanner_universe', 'scanner_universe_selection_v1',
       'scanner_universe_v1', array['AAPL'], 'pilot-config-v1',
       'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
       10, 5, 1),
      ('66666666-6666-4666-8666-666666666666', '${owner}', 'no-trade', 'ready',
       'intraday_long_multi_setup_quality_ranker', '1.0.0',
       'intraday_long_multi_setup_quality_ranker@1.0.0',
       'rotating_scanner_universe', 'scanner_universe_selection_v1',
       'scanner_universe_v1', array['AAPL'], 'pilot-config-v1',
       'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
       10, 5, 1);

    create table public.sv_c1_test_receipts as
      select * from ${entryCall()} with no data;
    grant insert, select on public.sv_c1_test_receipts to service_role;
  `);

  // First process: one atomic entry effect.
  psql(`
    set role service_role;
    insert into public.sv_c1_test_receipts select * from ${entryCall()};
    reset role;
    do $$ begin
      if (select disposition from public.sv_c1_test_receipts limit 1) <> 'created'
        or (select fill_price from public.sv_c1_test_receipts limit 1) <> 100.100000
        or (select total_cash_cost from public.sv_c1_test_receipts limit 1) <> 1002.000000
        or (select cash_balance from public.internal_paper_accounts where account_key = 'success') <> 98998.000000
        or (select state_version from public.internal_paper_accounts where account_key = 'success') <> 1
        or (select count(*) from public.internal_paper_entry_intents where account_id = '22222222-2222-4222-8222-222222222222') <> 1
        or (select count(*) from public.internal_paper_fills where account_id = '22222222-2222-4222-8222-222222222222') <> 1
        or (select count(*) from public.internal_paper_positions where account_id = '22222222-2222-4222-8222-222222222222') <> 1
        or (select count(*) from public.internal_paper_ledger_entries where account_id = '22222222-2222-4222-8222-222222222222') <> 3
        or (select sum(amount) from public.internal_paper_ledger_entries where account_id = '22222222-2222-4222-8222-222222222222') <> 0
        or (select decision_evidence_digest from public.internal_paper_entry_intents where account_id = '22222222-2222-4222-8222-222222222222') <>
          (select encode(extensions.digest(convert_to((payload_json #> '{candidate_decision_record}')::text, 'UTF8'), 'sha256'), 'hex') from public.recommendation_scan_runs where id = 'scan-1')
      then raise exception 'atomic paper entry state was not committed or balanced'; end if;
    end $$;
  `);

  // A new database session simulates a worker restart. The same command must
  // resolve to the exact durable effect without new economic rows.
  psql(`
    set role service_role;
    insert into public.sv_c1_test_receipts select * from ${entryCall()};
    reset role;
    do $$ begin
      if (select count(*) from public.sv_c1_test_receipts) <> 2
        or (select disposition from public.sv_c1_test_receipts offset 1 limit 1) <> 'reused'
        or (select count(distinct intent_id) from public.sv_c1_test_receipts) <> 1
        or (select count(distinct fill_id) from public.sv_c1_test_receipts) <> 1
        or (select count(distinct position_id) from public.sv_c1_test_receipts) <> 1
        or (select count(*) from public.internal_paper_ledger_entries where account_id = '22222222-2222-4222-8222-222222222222') <> 3
        or (select state_version from public.internal_paper_accounts where account_key = 'success') <> 1
      then raise exception 'restart retry created a duplicate economic effect'; end if;
    end $$;

    set role service_role;
    do $$ declare r jsonb; begin
      r := public.app_read_internal_paper_account_v1(
        '${owner}', '22222222-2222-4222-8222-222222222222',
        'internal_paper_readback_v1'
      );
      if r ->> 'state_version' <> '1'
        or jsonb_array_length(r -> 'open_positions') <> 1
        or r ->> 'ledger_entry_count' <> '3'
        or (r ->> 'ledger_balance')::numeric <> 0
      then raise exception 'durable restart readback did not reconcile'; end if;
    end $$;
  `);

  psql(`
    do $$ begin
      begin
        set local role service_role;
        perform ${entryCall({ quantity: 11 })};
        raise exception 'expected conflicting retry';
      exception when others then
        if sqlerrm = 'expected conflicting retry' then raise; end if;
        if sqlerrm <> 'internal_paper_entry_command_conflict' then raise; end if;
      end;
    end $$;

    do $$ begin
      begin
        set local role service_role;
        perform ${entryCall({
          account: "33333333-3333-4333-8333-333333333333",
          snapshot: "snapshot-risk",
          snapshotFingerprint: "snapshot-fingerprint-risk",
        })};
        raise exception 'expected killed-account rejection';
      exception when others then
        if sqlerrm = 'expected killed-account rejection' then raise; end if;
        if sqlerrm <> 'internal_paper_account_not_ready' then raise; end if;
      end;
    end $$;

    do $$ begin
      begin
        set local role service_role;
        perform ${entryCall({
          account: "44444444-4444-4444-8444-444444444444",
          snapshot: "snapshot-risk",
          snapshotFingerprint: "snapshot-fingerprint-risk",
        })};
        raise exception 'expected risk rejection';
      exception when others then
        if sqlerrm = 'expected risk rejection' then raise; end if;
        if sqlerrm <> 'internal_paper_entry_risk_rejected' then raise; end if;
      end;
    end $$;

    do $$ begin
      begin
        set local role service_role;
        perform ${entryCall({ callOwner: otherOwner })};
        raise exception 'expected owner rejection';
      exception when others then
        if sqlerrm = 'expected owner rejection' then raise; end if;
        if sqlerrm <> 'internal_paper_account_not_found' then raise; end if;
      end;
    end $$;

    do $$ begin
      begin
        set local role service_role;
        perform ${entryCall({
          account: "66666666-6666-4666-8666-666666666666",
          snapshot: "snapshot-no-trade",
          snapshotFingerprint: "snapshot-fingerprint-no-trade",
          scan: "scan-no-trade",
          scanFingerprint: "scan-no-trade-fingerprint",
        })};
        raise exception 'expected no-trade rejection';
      exception when others then
        if sqlerrm = 'expected no-trade rejection' then raise; end if;
        if sqlerrm <> 'internal_paper_decision_not_reconstructable' then raise; end if;
      end;
    end $$;

    do $$ begin
      begin
        set local role anon;
        perform ${entryCall()};
        raise exception 'anon unexpectedly executed internal-paper command';
      exception when insufficient_privilege then null;
      end;
    end $$;

    do $$ begin
      begin
        set local role authenticated;
        perform count(*) from public.internal_paper_accounts;
        raise exception 'authenticated unexpectedly read internal-paper tables';
      exception when insufficient_privilege then null;
      end;
    end $$;
  `);

  psql(`
    create function public.sv_c1_force_ledger_failure() returns trigger
    language plpgsql as $$ begin
      if new.account_id = '55555555-5555-4555-8555-555555555555'::uuid then
        raise exception 'forced ledger failure';
      end if;
      return new;
    end $$;
    create trigger sv_c1_force_ledger_failure
      before insert on public.internal_paper_ledger_entries
      for each row execute function public.sv_c1_force_ledger_failure();

    do $$ begin
      begin
        set local role service_role;
        perform ${entryCall({
          account: "55555555-5555-4555-8555-555555555555",
          snapshot: "snapshot-rollback",
          snapshotFingerprint: "snapshot-fingerprint-rollback",
        })};
        raise exception 'expected forced ledger failure';
      exception when others then
        if sqlerrm = 'expected forced ledger failure' then raise; end if;
        if sqlerrm <> 'forced ledger failure' then raise; end if;
      end;
    end $$;
    reset role;

    do $$ begin
      if (select count(*) from public.internal_paper_entry_intents where account_id = '55555555-5555-4555-8555-555555555555') <> 0
        or (select count(*) from public.internal_paper_fills where account_id = '55555555-5555-4555-8555-555555555555') <> 0
        or (select count(*) from public.internal_paper_positions where account_id = '55555555-5555-4555-8555-555555555555') <> 0
        or (select count(*) from public.internal_paper_ledger_entries where account_id = '55555555-5555-4555-8555-555555555555') <> 0
        or (select cash_balance from public.internal_paper_accounts where account_key = 'rollback') <> 100000
        or (select state_version from public.internal_paper_accounts where account_key = 'rollback') <> 0
      then raise exception 'failed paper entry was not fully rolled back'; end if;
    end $$;
  `);

  console.log(
    "SV-C1 disposable PostgreSQL entry lifecycle, restart, isolation, risk and rollback tests passed.",
  );
} finally {
  try {
    docker("rm", "-f", container);
  } catch {}
  rmSync(sqlPath, { force: true });
}
