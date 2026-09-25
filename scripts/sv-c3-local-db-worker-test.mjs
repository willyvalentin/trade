#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const container = `ture-sv-c3-${process.pid}`;
const sqlPath = join(tmpdir(), `ture-sv-c3-${process.pid}.sql`);
const prerequisiteMigrations = [
  "../supabase/migrations/20260709000000_create_historical_candle_storage.sql",
  "../supabase/migrations/20260922001000_sv_c1_internal_paper_entry_lifecycle.sql",
  "../supabase/migrations/20260922023000_sv_c2_internal_paper_exit_reconciliation.sql",
  "../supabase/migrations/20260924195853_sv_c1_internal_paper_foreign_key_indexes.sql",
  "../supabase/migrations/20260924222835_sv_c2_internal_paper_foreign_key_indexes.sql",
].map((path) => new URL(path, import.meta.url));
const c3Migration = new URL(
  "../supabase/migrations/20260922045917_sv_c3_durable_internal_paper_worker.sql",
  import.meta.url,
);
const c4Migration = new URL(
  "../supabase/migrations/20260922062854_sv_c4_internal_paper_handoff_context.sql",
  import.meta.url,
);
const d1Migration = new URL(
  "../supabase/migrations/20260922073013_sv_d1_internal_paper_observer_read_model.sql",
  import.meta.url,
);
const c5Migration = new URL(
  "../supabase/migrations/20260922090000_sv_c5_internal_paper_pilot_operational_admission.sql",
  import.meta.url,
);
const c6Migration = new URL(
  "../supabase/migrations/20260925030000_sv_c6_provider_rights_admission.sql",
  import.meta.url,
);
const c7Migration = new URL(
  "../supabase/migrations/20260925031531_sv_c7_internal_paper_pilot_provisioning.sql",
  import.meta.url,
);

const owner = "11111111-1111-4111-8111-111111111111";
const account = "22222222-2222-4222-8222-222222222222";
const secondAccount = "33333333-3333-4333-8333-333333333333";

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

function psqlExpectFailure(sql, expectedMessage) {
  try {
    psql(sql);
  } catch (error) {
    const output = [error?.stdout, error?.stderr, error?.message]
      .filter(Boolean)
      .join("\n");
    if (!output.includes(expectedMessage)) {
      throw new Error(
        `Expected PostgreSQL failure ${expectedMessage}, received:\n${output}`,
      );
    }
    return;
  }
  throw new Error(`Expected PostgreSQL failure ${expectedMessage}`);
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
  for (const migration of prerequisiteMigrations) {
    psql(readFileSync(migration, "utf8"));
  }

  // Production admission must fail before any C3 DDL if durable paper state
  // already exists. The fixture is removed before the reviewed empty-state
  // migration is applied.
  psql(`
    insert into public.internal_paper_accounts(
      id, owner_user_id, account_key, status, strategy_id, strategy_version,
      strategy_rollback_identity, symbol_selection_policy_id,
      symbol_selection_policy_version, observed_universe_version,
      eligible_symbols, config_version, fill_model_version, starting_cash,
      cash_balance, per_trade_risk_cap, daily_loss_cap, spread_bps,
      slippage_bps, commission_per_order
    ) values (
      '${account}', '${owner}', 'preflight-only', 'paused', 'pilot-strategy',
      '1.0.0', 'pilot-strategy@1.0.0', 'pilot-symbols', '1.0.0',
      'pilot-universe-v1', array['AAPL'], 'pilot-config-v1',
      'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
      10, 5, 1
    );
  `);
  psqlExpectFailure(
    readFileSync(c3Migration, "utf8"),
    "sv_c3_requires_empty_c1_c2_state",
  );
  psql(`
    do $$ begin
      if pg_catalog.to_regclass('public.internal_paper_worker_jobs') is not null
        or pg_catalog.to_regprocedure(
          'public.app_enqueue_internal_paper_worker_job_v1(uuid,uuid,text,jsonb,text)'
        ) is not null
      then raise exception 'C3 DDL leaked through non-empty preflight'; end if;
    end $$;
    delete from public.internal_paper_accounts where id = '${account}';
  `);

  // A same-named pre-existing function is catalog drift, not an object that
  // the migration may replace in place.
  psql(`
    create function public.app_read_internal_paper_worker_v1(uuid, uuid, text)
    returns jsonb language sql as 'select ''{}''::jsonb';
  `);
  psqlExpectFailure(
    readFileSync(c3Migration, "utf8"),
    "sv_c3_preexisting_worker_contract",
  );
  psql(`
    do $$ begin
      if pg_catalog.to_regclass('public.internal_paper_worker_jobs') is not null
      then raise exception 'C3 table leaked through drift preflight'; end if;
    end $$;
    drop function public.app_read_internal_paper_worker_v1(uuid, uuid, text);
  `);

  psql(readFileSync(c3Migration, "utf8"));

  // C4 must reject pre-existing durable paper state before creating its
  // service-role handoff function.
  psql(`
    insert into public.internal_paper_accounts(
      id, owner_user_id, account_key, status, strategy_id, strategy_version,
      strategy_rollback_identity, symbol_selection_policy_id,
      symbol_selection_policy_version, observed_universe_version,
      eligible_symbols, config_version, fill_model_version, starting_cash,
      cash_balance, per_trade_risk_cap, daily_loss_cap, spread_bps,
      slippage_bps, commission_per_order
    ) values (
      '${account}', '${owner}', 'c4-preflight-only', 'paused', 'pilot-strategy',
      '1.0.0', 'pilot-strategy@1.0.0', 'pilot-symbols', '1.0.0',
      'pilot-universe-v1', array['AAPL'], 'pilot-config-v1',
      'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
      10, 5, 1
    );
  `);
  psqlExpectFailure(
    readFileSync(c4Migration, "utf8"),
    "sv_c4_requires_empty_c1_c2_c3_state",
  );
  psql(`
    do $$ begin
      if pg_catalog.to_regprocedure(
        'public.app_read_internal_paper_handoff_context_v1(uuid,uuid,text)'
      ) is not null
      then raise exception 'C4 DDL leaked through non-empty preflight'; end if;
    end $$;
    delete from public.internal_paper_accounts where id = '${account}';
  `);

  // A drifted predecessor function fails before C4 creates anything.
  psql(`
    alter function public.app_read_internal_paper_worker_v1(uuid, uuid, text)
      security invoker;
  `);
  psqlExpectFailure(
    readFileSync(c4Migration, "utf8"),
    "sv_c4_unexpected_worker_function_contract",
  );
  psql(`
    do $$ begin
      if pg_catalog.to_regprocedure(
        'public.app_read_internal_paper_handoff_context_v1(uuid,uuid,text)'
      ) is not null
      then raise exception 'C4 DDL leaked through predecessor drift'; end if;
    end $$;
    alter function public.app_read_internal_paper_worker_v1(uuid, uuid, text)
      security definer;
  `);

  // Same-signature C4 drift is rejected instead of replaced.
  psql(`
    create function public.app_read_internal_paper_handoff_context_v1(
      uuid, uuid, text
    ) returns jsonb language sql as 'select ''{}''::jsonb';
  `);
  psqlExpectFailure(
    readFileSync(c4Migration, "utf8"),
    "sv_c4_preexisting_handoff_contract",
  );
  psql(`
    drop function public.app_read_internal_paper_handoff_context_v1(
      uuid, uuid, text
    );
  `);

  psql(readFileSync(c4Migration, "utf8"));

  // D1 must reject any existing durable paper state before it creates the
  // service-role observer projection.
  psql(`
    insert into public.internal_paper_accounts(
      id, owner_user_id, account_key, status, strategy_id, strategy_version,
      strategy_rollback_identity, symbol_selection_policy_id,
      symbol_selection_policy_version, observed_universe_version,
      eligible_symbols, config_version, fill_model_version, starting_cash,
      cash_balance, per_trade_risk_cap, daily_loss_cap, spread_bps,
      slippage_bps, commission_per_order
    ) values (
      '${account}', '${owner}', 'd1-preflight-only', 'paused', 'pilot-strategy',
      '1.0.0', 'pilot-strategy@1.0.0', 'pilot-symbols', '1.0.0',
      'pilot-universe-v1', array['AAPL'], 'pilot-config-v1',
      'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
      10, 5, 1
    );
  `);
  psqlExpectFailure(
    readFileSync(d1Migration, "utf8"),
    "sv_d1_requires_empty_c1_c2_c3_state",
  );
  psql(`
    do $$ begin
      if pg_catalog.to_regprocedure(
        'public.app_read_internal_paper_observer_v1(uuid,uuid,text)'
      ) is not null
      then raise exception 'D1 DDL leaked through non-empty preflight'; end if;
    end $$;
    delete from public.internal_paper_accounts where id = '${account}';
  `);

  // A drifted C4 function fails before D1 creates its observer function.
  psql(`
    alter function public.app_read_internal_paper_handoff_context_v1(
      uuid, uuid, text
    ) security invoker;
  `);
  psqlExpectFailure(
    readFileSync(d1Migration, "utf8"),
    "sv_d1_unexpected_handoff_function_contract",
  );
  psql(`
    alter function public.app_read_internal_paper_handoff_context_v1(
      uuid, uuid, text
    ) security definer;
  `);

  // Same-signature D1 drift is rejected instead of replaced.
  psql(`
    create function public.app_read_internal_paper_observer_v1(uuid, uuid, text)
    returns jsonb language sql as 'select ''{}''::jsonb';
  `);
  psqlExpectFailure(
    readFileSync(d1Migration, "utf8"),
    "sv_d1_preexisting_observer_contract",
  );
  psql(`
    drop function public.app_read_internal_paper_observer_v1(uuid, uuid, text);
  `);

  psql(readFileSync(d1Migration, "utf8"));

  // C5 must reject any existing durable paper state before creating policy,
  // heartbeat or v2 read/claim boundaries.
  psql(`
    insert into public.internal_paper_accounts(
      id, owner_user_id, account_key, status, strategy_id, strategy_version,
      strategy_rollback_identity, symbol_selection_policy_id,
      symbol_selection_policy_version, observed_universe_version,
      eligible_symbols, config_version, fill_model_version, starting_cash,
      cash_balance, per_trade_risk_cap, daily_loss_cap, spread_bps,
      slippage_bps, commission_per_order
    ) values (
      '${account}', '${owner}', 'c5-preflight-only', 'paused', 'pilot-strategy',
      '1.0.0', 'pilot-strategy@1.0.0', 'pilot-symbols', '1.0.0',
      'pilot-universe-v1', array['AAPL'], 'pilot-config-v1',
      'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
      10, 5, 1
    );
  `);
  psqlExpectFailure(
    readFileSync(c5Migration, "utf8"),
    "sv_c5_requires_empty_c1_c2_c3_state",
  );
  psql(`
    do $$ begin
      if pg_catalog.to_regclass('public.internal_paper_pilot_policies') is not null
        or pg_catalog.to_regclass('public.internal_paper_worker_heartbeats') is not null
      then raise exception 'C5 DDL leaked through non-empty preflight'; end if;
    end $$;
    delete from public.internal_paper_accounts where id = '${account}';
  `);

  // A drifted D1 function fails before C5 creates any schema.
  psql(`
    alter function public.app_read_internal_paper_observer_v1(uuid, uuid, text)
      security invoker;
  `);
  psqlExpectFailure(
    readFileSync(c5Migration, "utf8"),
    "sv_c5_unexpected_read_boundary_contract",
  );
  psql(`
    alter function public.app_read_internal_paper_observer_v1(uuid, uuid, text)
      security definer;
  `);

  // Same-signature C5 drift is rejected instead of replaced.
  psql(`
    create function public.app_read_internal_paper_observer_v2(uuid, uuid, text)
    returns jsonb language sql as 'select ''{}''::jsonb';
  `);
  psqlExpectFailure(
    readFileSync(c5Migration, "utf8"),
    "sv_c5_preexisting_operational_admission_contract",
  );
  psql(`
    drop function public.app_read_internal_paper_observer_v2(uuid, uuid, text);
  `);

  psql(readFileSync(c5Migration, "utf8"));

  // C6 refuses to retrofit rights evidence onto a policy that was already
  // frozen through the older free-form reference boundary.
  psql(`
    insert into public.internal_paper_accounts(
      id, owner_user_id, account_key, status, strategy_id, strategy_version,
      strategy_rollback_identity, symbol_selection_policy_id,
      symbol_selection_policy_version, observed_universe_version,
      eligible_symbols, config_version, fill_model_version, starting_cash,
      cash_balance, per_trade_risk_cap, daily_loss_cap, spread_bps,
      slippage_bps, commission_per_order
    ) values (
      '${account}', '${owner}', 'c6-preflight-only', 'paused',
      'pilot-strategy', '1.0.0', 'pilot-strategy@1.0.0', 'pilot-symbols',
      '1.0.0', 'pilot-universe-v1', array['AAPL'], 'pilot-config-v1',
      'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
      10, 5, 1
    );
    set role service_role;
    select public.app_freeze_internal_paper_pilot_policy_v1(
      '${owner}', '${account}',
      'internal_paper_pilot_operating_policy_2026_09_22_v1',
      'pre-c6:free-form-entitlement', 'pre-c6:free-form-retention',
      30, 104857600, '2026-09-22T14:00:00Z'
    );
    reset role;
  `);
  psqlExpectFailure(
    readFileSync(c6Migration, "utf8"),
    "sv_c6_requires_empty_pilot_policy_state",
  );
  psql(`
    do $$ begin
      if pg_catalog.to_regclass(
        'public.internal_paper_provider_rights_evidence'
      ) is not null then
        raise exception 'C6 schema leaked through non-empty preflight';
      end if;
    end $$;
    delete from public.internal_paper_pilot_policies where account_id = '${account}';
    delete from public.internal_paper_accounts where id = '${account}';
  `);
  psql(readFileSync(c6Migration, "utf8"));
  psql(readFileSync(c7Migration, "utf8"));

  // C7 must fail atomically against the reviewed blocked Basic Free evidence.
  // Tests then add one admitted fixture so provisioning can exercise its
  // positive and idempotent path without weakening production evidence.
  psql(`
    set role service_role;
    create temporary table blocked_rights_receipt as
      select public.app_read_internal_paper_provider_rights_evidence_v1(
        'provider_rights_twelve_data_basic_free_2026_09_25_v1',
        'internal_paper_provider_rights_evidence_reader_v1'
      ) receipt;
    reset role;
    do $$ begin
      if (select receipt ->> 'admission_status' from blocked_rights_receipt)
          <> 'blocked'
        or (select receipt ->> 'max_exact_price_evidence_retention_days'
            from blocked_rights_receipt) is not null
      then raise exception 'C6 blocked rights receipt invariant failed'; end if;
    end $$;

    set role service_role;
    do $$ begin
      begin
        perform public.app_provision_internal_paper_pilot_v1(
          '${owner}', '${account}', 'pilot', 'pilot-strategy', '1.0.0',
          'pilot-strategy@1.0.0', 'pilot-symbols', '1.0.0',
          'pilot-universe-v1', array['aapl'], 'pilot-config-v1',
          100000, 100, 500, 10, 5, 1,
          'provider_rights_twelve_data_basic_free_2026_09_25_v1',
          30, 104857600, '2026-09-22T14:29:30Z',
          'internal_paper_pilot_provisioning_v1'
        );
        raise exception 'C7 unexpectedly provisioned against blocked rights';
      exception when raise_exception then
        if sqlerrm <> 'internal_paper_provider_rights_not_admitted' then
          raise;
        end if;
      end;
    end $$;
    reset role;
    do $$ begin
      if exists (select 1 from public.internal_paper_accounts)
        or exists (select 1 from public.internal_paper_pilot_policies)
      then raise exception 'C7 blocked provisioning was not atomic'; end if;
    end $$;

    insert into public.internal_paper_provider_rights_evidence(
      evidence_id, provider_plan, admission_status, evidence_document_path,
      evidence_document_sha256, entitlement_evidence_reference,
      retention_rights_evidence_reference, internal_non_display_allowed,
      noncommercial_use_required, raw_provider_payload_retention_bytes,
      non_reversible_derived_data_allowed,
      max_exact_price_evidence_retention_days,
      termination_data_deletion_required, reason_codes, reviewed_at,
      source_terms_effective_date
    ) values (
      'provider_rights_test_fixture_v1', 'twelve_data_basic_free', 'admitted',
      'test-fixture-only',
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'fixture:basic-free-entitlement',
      'fixture:derived-evidence-retention', true, true, 0, true, 30, true,
      array['written_test_fixture_confirmation'],
      '2026-09-22T14:29:00Z', '2026-01-01'
    );

    set role service_role;
    create temporary table provisioning_receipts as
      select public.app_provision_internal_paper_pilot_v1(
        '${owner}', '${account}', 'pilot', 'pilot-strategy', '1.0.0',
        'pilot-strategy@1.0.0', 'pilot-symbols', '1.0.0',
        'pilot-universe-v1', array['aapl'], 'pilot-config-v1',
        100000, 100, 500, 10, 5, 1,
        'provider_rights_test_fixture_v1', 30, 104857600,
        '2026-09-22T14:29:30Z',
        'internal_paper_pilot_provisioning_v1'
      ) receipt;
    insert into provisioning_receipts
      select public.app_provision_internal_paper_pilot_v1(
        '${owner}', '${account}', 'pilot', 'pilot-strategy', '1.0.0',
        'pilot-strategy@1.0.0', 'pilot-symbols', '1.0.0',
        'pilot-universe-v1', array['AAPL'], 'pilot-config-v1',
        100000, 100, 500, 10, 5, 1,
        'provider_rights_test_fixture_v1', 30, 104857600,
        '2026-09-22T14:29:30Z',
        'internal_paper_pilot_provisioning_v1'
      );
    do $$ begin
      begin
        perform public.app_provision_internal_paper_pilot_v1(
          '${owner}', '${account}', 'pilot', 'pilot-strategy', '1.0.0',
          'pilot-strategy@1.0.0', 'pilot-symbols', '1.0.0',
          'pilot-universe-v1', array['AAPL'], 'pilot-config-v1',
          100001, 100, 500, 10, 5, 1,
          'provider_rights_test_fixture_v1', 30, 104857600,
          '2026-09-22T14:29:30Z',
          'internal_paper_pilot_provisioning_v1'
        );
        raise exception 'C7 unexpectedly accepted an altered retry';
      exception when raise_exception then
        if sqlerrm <> 'internal_paper_pilot_provisioning_conflict' then
          raise;
        end if;
      end;
      begin
        perform public.app_provision_internal_paper_pilot_v1(
          '${owner}', '${secondAccount}', 'pilot-retention',
          'pilot-strategy', '1.0.0', 'pilot-strategy@1.0.0',
          'pilot-symbols', '1.0.0', 'pilot-universe-v1', array['AAPL'],
          'pilot-config-v1', 100000, 100, 500, 10, 5, 1,
          'provider_rights_test_fixture_v1', 31, 104857600,
          '2026-09-22T14:29:30Z',
          'internal_paper_pilot_provisioning_v1'
        );
        raise exception 'C7 unexpectedly exceeded rights retention';
      exception when raise_exception then
        if sqlerrm <> 'internal_paper_provider_rights_retention_exceeded' then
          raise;
        end if;
      end;
    end $$;
    reset role;
    do $$ begin
      if (select receipt ->> 'disposition' from provisioning_receipts limit 1)
          <> 'created'
        or (select receipt ->> 'policy_disposition'
            from provisioning_receipts limit 1) <> 'created'
        or (select receipt ->> 'disposition'
            from provisioning_receipts offset 1 limit 1) <> 'reused'
        or (select receipt ->> 'policy_disposition'
            from provisioning_receipts offset 1 limit 1) <> 'reused'
        or (select receipt -> 'eligible_symbols' ->> 0
            from provisioning_receipts limit 1) <> 'AAPL'
        or (select count(*) from public.internal_paper_accounts) <> 1
        or (select count(*) from public.internal_paper_pilot_policies) <> 1
        or (select status from public.internal_paper_accounts
            where id = '${account}') <> 'paused'
        or exists (select 1 from public.internal_paper_accounts
                   where id = '${secondAccount}')
      then raise exception 'C7 provisioning invariant failed'; end if;
    end $$;
  `);

  // The policy and heartbeat child foreign keys must all have valid, ready
  // covering indexes in their foreign-key column order.
  psql(`
    do $$
    declare
      v_foreign_key_count integer;
      v_uncovered_count integer;
    begin
      select count(*) into v_foreign_key_count
      from pg_catalog.pg_constraint foreign_key
      where foreign_key.conrelid in (
        'public.internal_paper_pilot_policies'::regclass,
        'public.internal_paper_worker_heartbeats'::regclass
      ) and foreign_key.contype = 'f';

      select count(*) into v_uncovered_count
      from pg_catalog.pg_constraint foreign_key
      where foreign_key.conrelid in (
        'public.internal_paper_pilot_policies'::regclass,
        'public.internal_paper_worker_heartbeats'::regclass
      ) and foreign_key.contype = 'f'
        and not exists (
          select 1
          from pg_catalog.pg_index index_record
          where index_record.indrelid = foreign_key.conrelid
            and index_record.indisvalid
            and index_record.indisready
            and not exists (
              select 1
              from unnest(foreign_key.conkey) with ordinality
                as foreign_key_column(attnum, ord)
              where (index_record.indkey::smallint[])[foreign_key_column.ord - 1]
                is distinct from foreign_key_column.attnum
            )
        );

      if v_foreign_key_count <> 4 or v_uncovered_count <> 0 then
        raise exception 'C5 foreign-key index coverage failed: total %, uncovered %',
          v_foreign_key_count, v_uncovered_count;
      end if;
    end $$;
  `);

  // Every C3 child foreign key must have a valid, ready index whose leading
  // key columns match the foreign-key column order.
  psql(`
    do $$
    declare
      v_foreign_key_count integer;
      v_uncovered_count integer;
    begin
      select count(*) into v_foreign_key_count
      from pg_catalog.pg_constraint foreign_key
      where foreign_key.conrelid = 'public.internal_paper_worker_jobs'::regclass
        and foreign_key.contype = 'f';

      select count(*) into v_uncovered_count
      from pg_catalog.pg_constraint foreign_key
      where foreign_key.conrelid = 'public.internal_paper_worker_jobs'::regclass
        and foreign_key.contype = 'f'
        and not exists (
          select 1
          from pg_catalog.pg_index index_record
          where index_record.indrelid = foreign_key.conrelid
            and index_record.indisvalid
            and index_record.indisready
            and not exists (
              select 1
              from unnest(foreign_key.conkey) with ordinality
                as foreign_key_column(attnum, ord)
              where (index_record.indkey::smallint[])[foreign_key_column.ord - 1]
                is distinct from foreign_key_column.attnum
            )
        );

      if v_foreign_key_count <> 2 or v_uncovered_count <> 0 then
        raise exception 'C3 foreign-key index coverage failed: total %, uncovered %',
          v_foreign_key_count, v_uncovered_count;
      end if;
    end $$;
  `);

  // Keep queue availability on the fixture's logical clock. The production
  // default is wall-clock now(), which would make this historical test expire
  // once real time passes the claim timestamps below.
  psql(`
    alter table public.internal_paper_worker_jobs
      alter column available_at
      set default '2026-09-22T14:28:00Z'::timestamptz;
  `);

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
  `);

  // C4 exposes only the exact frozen account context to the service-role handoff.
  psql(`
    set role service_role;
    create temporary table handoff_context as
      select public.app_read_internal_paper_handoff_context_v1(
        '${owner}', '${account}', 'internal_paper_handoff_context_v1'
      ) receipt;
    reset role;
    do $$ begin
      if (select receipt ->> 'status' from handoff_context) <> 'paused'
        or (select receipt ->> 'config_version' from handoff_context) <> 'pilot-config-v1'
        or (select receipt -> 'eligible_symbols' ->> 0 from handoff_context) <> 'AAPL'
        or (select receipt ->> 'cash_balance' from handoff_context)::numeric <> 100000
      then raise exception 'C4 handoff context did not preserve frozen account facts'; end if;
    end $$;
  `);

  // C5 keeps handoff blocked until an immutable policy and a current
  // account-scoped worker heartbeat exist. C7 already froze the exact policy.
  psql(`
    set role service_role;
    do $$ begin
      begin
        perform public.app_freeze_internal_paper_pilot_policy_v1(
          '${owner}', '${account}',
          'internal_paper_pilot_operating_policy_2026_09_22_v1',
          'official:twelve_data_pricing_and_personal_usage:reviewed_2026_09_25',
          'official:twelve_data_terms_sections_2_6_12_16:effective_2026_01_01:reviewed_2026_09_25',
          30, 104857600, '2026-09-22T14:29:30Z'
        );
        raise exception 'C6 blocked rights unexpectedly froze a policy';
      exception when raise_exception then
        if sqlerrm <> 'internal_paper_provider_rights_not_admitted' then raise; end if;
      end;
    end $$;
    create temporary table policy_receipts as
      select public.app_freeze_internal_paper_pilot_policy_v1(
        '${owner}', '${account}',
        'internal_paper_pilot_operating_policy_2026_09_22_v1',
        'fixture:basic-free-entitlement', 'fixture:derived-evidence-retention',
        30, 104857600, '2026-09-22T14:29:30Z'
      ) receipt;
    insert into policy_receipts
      select public.app_freeze_internal_paper_pilot_policy_v1(
        '${owner}', '${account}',
        'internal_paper_pilot_operating_policy_2026_09_22_v1',
        'fixture:basic-free-entitlement', 'fixture:derived-evidence-retention',
        30, 104857600, '2026-09-22T14:29:30Z'
      );
    do $$ begin
      begin
        perform public.app_freeze_internal_paper_pilot_policy_v1(
          '${owner}', '${account}',
          'internal_paper_pilot_operating_policy_2026_09_22_v1',
          'fixture:basic-free-entitlement', 'fixture:derived-evidence-retention',
          30, 104857601, '2026-09-22T14:29:30Z'
        );
        raise exception 'C5 policy unexpectedly accepted mutation';
      exception when raise_exception then
        if sqlerrm <> 'internal_paper_pilot_policy_conflict' then raise; end if;
      end;
      begin
        perform public.app_record_internal_paper_worker_heartbeat_v1(
          '${account}', '2026-09-22T14:31:00Z', '2026-09-22T14:31:01Z',
          'internal_paper_worker_host_v1',
          'internal_paper_pilot_operating_policy_2026_09_22_v1'
        );
        raise exception 'C5 heartbeat unexpectedly accepted an off-slot timestamp';
      exception when raise_exception then
        if sqlerrm <> 'invalid_internal_paper_worker_heartbeat' then raise; end if;
      end;
    end $$;
    create temporary table heartbeat_receipts as
      select public.app_record_internal_paper_worker_heartbeat_v1(
        '${account}', '2026-09-22T14:30:00Z', '2026-09-22T14:30:30Z',
        'internal_paper_worker_host_v1',
        'internal_paper_pilot_operating_policy_2026_09_22_v1'
      ) receipt;
    insert into heartbeat_receipts
      select public.app_record_internal_paper_worker_heartbeat_v1(
        '${account}', '2026-09-22T14:30:00Z', '2026-09-22T14:30:30Z',
        'internal_paper_worker_host_v1',
        'internal_paper_pilot_operating_policy_2026_09_22_v1'
      );
    insert into heartbeat_receipts
      select public.app_record_internal_paper_worker_heartbeat_v1(
        '${account}', '2026-09-22T14:30:00Z', '2026-09-22T14:30:31Z',
        'internal_paper_worker_host_v1',
        'internal_paper_pilot_operating_policy_2026_09_22_v1'
      );
    create temporary table admitted_context as
      select public.app_read_internal_paper_handoff_context_v2(
        '${owner}', '${account}', 'internal_paper_handoff_context_v2',
        '2026-09-22T14:31:00Z'
      ) receipt;
    reset role;
    do $$ begin
      if (select receipt ->> 'disposition' from policy_receipts limit 1) <> 'reused'
        or (select receipt ->> 'disposition' from policy_receipts offset 1 limit 1) <> 'reused'
        or (select receipt ->> 'disposition' from heartbeat_receipts limit 1) <> 'created'
        or (select receipt ->> 'disposition' from heartbeat_receipts offset 1 limit 1) <> 'reused'
        or (select receipt ->> 'disposition' from heartbeat_receipts offset 2 limit 1) <> 'reused'
        or (select receipt ->> 'observed_at' from heartbeat_receipts offset 2 limit 1)::timestamptz
          <> '2026-09-22T14:30:30Z'::timestamptz
        or (select receipt #>> '{operational_admission,status}' from admitted_context) <> 'ready'
        or (select receipt #>> '{operational_admission,max_source_age_seconds}' from admitted_context)::integer <> 600
      then raise exception 'C5 policy freeze or operational admission invariant failed'; end if;
    end $$;
    update public.internal_paper_accounts set status = 'ready' where id = '${account}';
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
      select public.app_claim_internal_paper_worker_job_v2(
        '${account}', 'worker-one', '2026-09-22T14:31:05Z', 60,
        'internal_paper_worker_claim_v2'
      ) receipt;
    create temporary table claim_blocked as
      select public.app_claim_internal_paper_worker_job_v2(
        '${account}', 'worker-two', '2026-09-22T14:31:06Z', 60,
        'internal_paper_worker_claim_v2'
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
        or (select fill_price from public.internal_paper_fills where account_id = '${account}') <> 100.100000
        or (select spread_cost from public.internal_paper_fills where account_id = '${account}') <> 0.500000
        or (select slippage_cost from public.internal_paper_fills where account_id = '${account}') <> 0.500000
        or (select total_cash_cost from public.internal_paper_fills where account_id = '${account}') <> 1002.000000
        or (select cash_balance from public.internal_paper_accounts where id = '${account}') <> 98998.000000
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
    create temporary table stale_heartbeat_claim as
      select public.app_claim_internal_paper_worker_job_v2(
        '${account}', 'worker-stale-heartbeat', '2026-09-22T15:00:00Z', 60,
        'internal_paper_worker_claim_v2'
      ) receipt;
    select public.app_record_internal_paper_worker_heartbeat_v1(
      '${account}', '2026-09-22T15:00:00Z', '2026-09-22T15:00:01Z',
      'internal_paper_worker_host_v1',
      'internal_paper_pilot_operating_policy_2026_09_22_v1'
    );
    create temporary table exit_claim as
      select public.app_claim_internal_paper_worker_job_v2(
        '${account}', 'worker-exit', '2026-09-22T15:00:04Z', 60,
        'internal_paper_worker_claim_v2'
      ) receipt;
    do $$ begin
      if (select receipt ->> 'reason_code' from stale_heartbeat_claim) <> 'worker_heartbeat_not_current'
        or (select receipt ->> 'work_kind' from exit_claim) <> 'exit'
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
        or (select reference_price from public.internal_paper_exit_fills where account_id = '${account}') <> 94.000000
        or (select fill_price from public.internal_paper_exit_fills where account_id = '${account}') <> 93.906000
        or (select spread_cost from public.internal_paper_exit_fills where account_id = '${account}') <> 0.470000
        or (select slippage_cost from public.internal_paper_exit_fills where account_id = '${account}') <> 0.470000
        or (select net_cash_proceeds from public.internal_paper_exit_fills where account_id = '${account}') <> 938.060000
        or (select gross_pnl from public.internal_paper_exit_fills where account_id = '${account}') <> -61.940000
        or (select net_pnl from public.internal_paper_exit_fills where account_id = '${account}') <> -63.940000
        or (select cash_balance from public.internal_paper_accounts where id = '${account}') <> 99936.060000
        or (select realized_net_pnl from public.internal_paper_accounts where id = '${account}') <> -63.940000
      then raise exception 'exit worker did not reconcile C2 effect'; end if;
    end $$;
  `);

  // Expired leases are reclaimed; the retained no-trade produces zero economics.
  psql(`
    set role service_role;
    create temporary table stale_claim as
      select public.app_claim_internal_paper_worker_job_v2(
        '${account}', 'worker-stale', '2026-09-22T15:01:00Z', 15,
        'internal_paper_worker_claim_v2'
      ) receipt;
    create temporary table reclaimed_claim as
      select public.app_claim_internal_paper_worker_job_v2(
        '${account}', 'worker-restart', '2026-09-22T15:01:16Z', 60,
        'internal_paper_worker_claim_v2'
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
      select public.app_claim_internal_paper_worker_job_v2(
        '${account}', 'worker-retry-one', '2026-09-22T15:02:00Z', 60,
        'internal_paper_worker_claim_v2'
      ) receipt;
    select public.app_release_internal_paper_worker_job_v1(
      ((select receipt ->> 'job_id' from retry_claim_one))::uuid,
      ((select receipt ->> 'lease_token' from retry_claim_one))::uuid,
      '2026-09-22T15:02:01Z', '2026-09-22T15:02:31Z',
      'worker_execution_failed', 'internal_paper_worker_job_v1'
    );
    create temporary table before_backoff as
      select public.app_claim_internal_paper_worker_job_v2(
        '${account}', 'worker-too-early', '2026-09-22T15:02:30Z', 60,
        'internal_paper_worker_claim_v2'
      ) receipt;
    create temporary table retry_claim_two as
      select public.app_claim_internal_paper_worker_job_v2(
        '${account}', 'worker-retry-two', '2026-09-22T15:02:31Z', 60,
        'internal_paper_worker_claim_v2'
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

  // A worker admitted for one account cannot claim another account's queue.
  psql(`
    insert into public.internal_paper_accounts(
      id, owner_user_id, account_key, status, strategy_id, strategy_version,
      strategy_rollback_identity, symbol_selection_policy_id,
      symbol_selection_policy_version, observed_universe_version,
      eligible_symbols, config_version, fill_model_version, starting_cash,
      cash_balance, per_trade_risk_cap, daily_loss_cap, spread_bps,
      slippage_bps, commission_per_order
    ) values (
      '${secondAccount}', '${owner}', 'pilot-second', 'paused',
      'pilot-strategy', '1.0.0', 'pilot-strategy@1.0.0', 'pilot-symbols',
      '1.0.0', 'pilot-universe-v1', array['AAPL'], 'pilot-config-second-v1',
      'internal_paper_immediate_costed_fill_v1', 100000, 100000, 100, 500,
      10, 5, 1
    );
    set role service_role;
    select public.app_freeze_internal_paper_pilot_policy_v1(
      '${owner}', '${secondAccount}',
      'internal_paper_pilot_operating_policy_2026_09_22_v1',
      'fixture:basic-free-entitlement', 'fixture:derived-evidence-retention',
      30, 104857600, '2026-09-22T14:59:30Z'
    );
    select public.app_record_internal_paper_worker_heartbeat_v1(
      '${secondAccount}', '2026-09-22T15:00:00Z', '2026-09-22T15:00:01Z',
      'internal_paper_worker_host_v1',
      'internal_paper_pilot_operating_policy_2026_09_22_v1'
    );
    reset role;
    update public.internal_paper_accounts set status = 'ready'
      where id = '${secondAccount}';
    set role service_role;
    select public.app_enqueue_internal_paper_worker_job_v1(
      '${owner}', '${secondAccount}', 'no_trade', jsonb_build_object(
        'record_version', 'candidate_decision_record_v3',
        'disposition', 'no_trade', 'owner_user_id', '${owner}',
        'account_id', '${secondAccount}', 'scan_run_id', 'scan-no-trade',
        'scan_run_fingerprint', 'scan-no-trade-fingerprint',
        'no_trade_reason', 'below_publish_threshold'
      ), 'internal_paper_worker_job_v1'
    );
    create temporary table wrong_account_claim as
      select public.app_claim_internal_paper_worker_job_v2(
        '${account}', 'worker-account-one', '2026-09-22T15:03:00Z', 60,
        'internal_paper_worker_claim_v2'
      ) receipt;
    create temporary table right_account_claim as
      select public.app_claim_internal_paper_worker_job_v2(
        '${secondAccount}', 'worker-account-two', '2026-09-22T15:03:00Z', 60,
        'internal_paper_worker_claim_v2'
      ) receipt;
    do $$ begin
      if (select receipt ->> 'status' from wrong_account_claim) <> 'no_work'
        or (select receipt ->> 'status' from right_account_claim) <> 'claimed'
        or (select receipt ->> 'account_id' from right_account_claim) <> '${secondAccount}'
      then raise exception 'C5 account-scoped claim invariant failed'; end if;
    end $$;
    select public.app_execute_internal_paper_worker_job_v1(
      ((select receipt ->> 'job_id' from right_account_claim))::uuid,
      ((select receipt ->> 'lease_token' from right_account_claim))::uuid,
      '2026-09-22T15:03:01Z', 'internal_paper_worker_job_v1'
    );
    reset role;
  `);

  // Direct browser access and function execution remain denied.
  psql(`
    set role service_role;
    create temporary table observer_readback as
      select public.app_read_internal_paper_observer_v2(
        '${owner}', '${account}', 'internal_paper_observer_v2'
      ) receipt;
    reset role;
    do $$ begin
      if (select receipt ->> 'observer_version' from observer_readback) <> 'internal_paper_observer_v2'
        or (select receipt ->> 'owner_user_id' from observer_readback) <> '${owner}'
        or (select receipt ->> 'account_id' from observer_readback) <> '${account}'
        or (select receipt #>> '{engine_health,status}' from observer_readback) <> 'blocked'
        or (select receipt #>> '{latest_decision,no_trade_reason}' from observer_readback) <> 'insufficient_coverage'
        or (select receipt #>> '{positions,0,ticker}' from observer_readback) <> 'AAPL'
        or (select receipt #>> '{positions,0,status}' from observer_readback) <> 'closed'
        or (select receipt #> '{accounting,marked_equity}' from observer_readback) <> 'null'::jsonb
        or (select receipt #>> '{accounting,equity_status}' from observer_readback) <> 'unavailable_without_current_mark'
        or (select receipt #> '{freshness,threshold_seconds}' from observer_readback) <> 'null'::jsonb
        or (select receipt #>> '{freshness,classification}' from observer_readback) <> 'unclassified'
        or (select receipt #>> '{operational_admission,policy_version}' from observer_readback)
          <> 'internal_paper_pilot_operating_policy_2026_09_22_v1'
        or (select receipt #>> '{operational_admission,heartbeat_classification}' from observer_readback)
          not in ('fresh', 'stale', 'invalid_future')
      then raise exception 'D1/C5 observer did not preserve durable and honest readback'; end if;
      begin
        perform public.app_read_internal_paper_observer_v2(
          '${owner}', '${account}', null
        );
        raise exception 'D1 observer accepted a null contract version';
      exception when raise_exception then
        if sqlerrm <> 'invalid_internal_paper_observer_command' then raise; end if;
      end;
    end $$;

    do $$ begin
      begin
        set local role anon;
        perform count(*) from public.internal_paper_worker_jobs;
        raise exception 'anon unexpectedly read worker jobs';
      exception when insufficient_privilege then null;
      end;
      begin
        set local role authenticated;
        perform public.app_claim_internal_paper_worker_job_v2(
          '${account}', 'browser', now(), 60, 'internal_paper_worker_claim_v2'
        );
        raise exception 'authenticated unexpectedly claimed worker work';
      exception when insufficient_privilege then null;
      end;
      begin
        set local role authenticated;
        perform public.app_read_internal_paper_handoff_context_v2(
          '${owner}', '${account}', 'internal_paper_handoff_context_v2', now()
        );
        raise exception 'authenticated unexpectedly read handoff context';
      exception when insufficient_privilege then null;
      end;
      begin
        set local role authenticated;
        perform public.app_read_internal_paper_observer_v2(
          '${owner}', '${account}', 'internal_paper_observer_v2'
        );
        raise exception 'authenticated unexpectedly read paper observer';
      exception when insufficient_privilege then null;
      end;
      begin
        set local role authenticated;
        perform count(*) from public.internal_paper_pilot_policies;
        raise exception 'authenticated unexpectedly read pilot policies';
      exception when insufficient_privilege then null;
      end;
      begin
        set local role authenticated;
        perform count(*) from public.internal_paper_worker_heartbeats;
        raise exception 'authenticated unexpectedly read worker heartbeats';
      exception when insufficient_privilege then null;
      end;
      begin
        set local role authenticated;
        perform count(*) from public.internal_paper_provider_rights_evidence;
        raise exception 'authenticated unexpectedly read provider rights evidence';
      exception when insufficient_privilege then null;
      end;
      begin
        set local role authenticated;
        perform public.app_read_internal_paper_provider_rights_evidence_v1(
          'provider_rights_twelve_data_basic_free_2026_09_25_v1',
          'internal_paper_provider_rights_evidence_reader_v1'
        );
        raise exception 'authenticated unexpectedly invoked rights reader';
      exception when insufficient_privilege then null;
      end;
      begin
        set local role authenticated;
        perform public.app_provision_internal_paper_pilot_v1(
          '${owner}', '${secondAccount}', 'browser-pilot', 'pilot-strategy',
          '1.0.0', 'pilot-strategy@1.0.0', 'pilot-symbols', '1.0.0',
          'pilot-universe-v1', array['AAPL'], 'pilot-config-v1',
          100000, 100, 500, 10, 5, 1, 'provider_rights_test_fixture_v1',
          30, 104857600, '2026-09-22T14:29:30Z',
          'internal_paper_pilot_provisioning_v1'
        );
        raise exception 'authenticated unexpectedly provisioned paper pilot';
      exception when insufficient_privilege then null;
      end;
    end $$;
  `);

  console.log("SV-C3/C4/C5/C6/C7/D1/E1 durable lifecycle and exact fill-parity database proof passed");
} finally {
  try { docker("rm", "-f", container); } catch {}
  rmSync(sqlPath, { force: true });
}
