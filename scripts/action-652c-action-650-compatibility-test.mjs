#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const container = `ture-action-652c-650-${process.pid}`;
const temporarySql = join(tmpdir(), `ture-action-652c-650-${process.pid}.sql`);
const action650Ref = "origin/codex/action-650-production-data-access-containment";
const action650Path = "supabase/migrations/20260724002000_contain_production_trading_data_access.sql";
const action652Migration = readFileSync(
  new URL("../supabase/migrations/20260724001500_create_transactional_open_position_command.sql", import.meta.url),
  "utf8",
);

function command(binary, args) {
  return execFileSync(binary, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function docker(...args) {
  return command("docker", args);
}

function apply(sql) {
  writeFileSync(temporarySql, sql, "utf8");
  docker("cp", temporarySql, `${container}:/tmp/test.sql`);
  return docker("exec", "-e", "PGPASSWORD=postgres", container, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-f", "/tmp/test.sql");
}

const action650Migration = command("git", ["show", `${action650Ref}:${action650Path}`]);
const containedTables = [
  "recommendations", "positions", "position_updates", "user_settings", "scanner_cache",
  "market_calendar_cache", "market_regime_snapshots", "recommendation_batches",
  "recommendation_outcomes", "recommendation_scan_runs", "recommendation_snapshots",
  "scheduled_scan_runs", "scheduled_scan_attempts", "symbol_metadata", "execution_records",
  "execution_agent_runs", "execution_agent_progress_events", "execution_lifecycle_events",
  "execution_record_audit_events",
];

try {
  docker("run", "--rm", "-d", "--name", container, "-e", "POSTGRES_PASSWORD=postgres", "postgres:16-alpine");
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      docker("exec", "-e", "PGPASSWORD=postgres", container, "pg_isready", "-U", "postgres");
      break;
    } catch {
      if (attempt === 29) throw new Error("PostgreSQL did not become ready");
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  const tablesSql = containedTables
    .filter((table) => !["recommendations", "positions", "recommendation_snapshots"].includes(table))
    .map((table) => `create table public.${table} (id uuid primary key default gen_random_uuid());`)
    .join("\n");
  apply(`
    create extension if not exists pgcrypto;
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin;
    create table public.recommendations (id uuid primary key, ticker text not null, company_name text, status text not null default 'new');
    create table public.positions (id uuid primary key default gen_random_uuid(), recommendation_id uuid, ticker text not null, company_name text, entry_price numeric not null, position_size numeric, current_stop numeric, target_1 numeric, target_2 numeric, status text not null, execution_metadata jsonb);
    create table public.recommendation_snapshots (id text primary key, recommendation_id text, status text not null default 'visible', was_taken boolean not null default false, linked_position_id text, updated_at timestamptz not null default now());
    ${tablesSql}
  `);
  apply(action652Migration);
  apply(action650Migration);
  apply(`
    do $$ declare t text; begin
      foreach t in array array[${containedTables.map((table) => `'${table}'`).join(",")}] loop
        if has_table_privilege('anon', format('public.%I', t), 'select,insert,update,delete')
          or has_table_privilege('authenticated', format('public.%I', t), 'select,insert,update,delete')
          or not has_table_privilege('service_role', format('public.%I', t), 'select,insert,update,delete')
        then raise exception 'Action 650 role containment failed for %', t; end if;
      end loop;
    end $$;
    insert into public.recommendations(id, ticker, company_name)
      values ('44444444-4444-4444-8444-444444444444', 'AAPL', 'Apple');
    set role service_role;
    select * from public.app_open_position_transaction(
      '44444444-4444-4444-8444-444444444444', 'AAPL', 'Apple', 100, 2, 95, 110, 120,
      null, 'application_open_position_v1'
    );
    reset role;
    do $$ begin
      set local role anon;
      perform 1 from public.positions;
      raise exception 'anon could read contained table';
    exception when insufficient_privilege then null;
    end $$;
  `);
  console.log("Action 652C -> Action 650 synthetic migration replay passed.");
} finally {
  try { docker("rm", "-f", container); } catch {}
  rmSync(temporarySql, { force: true });
}
