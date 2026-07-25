#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const container = `ture-action-652c-${process.pid}`;
const sqlPath = join(tmpdir(), `ture-action-652c-${process.pid}.sql`);
const migrationPath = new URL(
  "../supabase/migrations/20260724001500_create_transactional_open_position_command.sql",
  import.meta.url,
);

function docker(...args) {
  return execFileSync("docker", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function psql(sql) {
  writeFileSync(sqlPath, sql, "utf8");
  docker("cp", sqlPath, `${container}:/tmp/test.sql`);
  return docker("exec", "-e", "PGPASSWORD=postgres", container, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-f", "/tmp/test.sql");
}

const migration = readFileSync(migrationPath, "utf8");

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

  psql(`
    create extension if not exists pgcrypto;
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin;
    create table public.recommendations (
      id uuid primary key default gen_random_uuid(), ticker text not null,
      company_name text, status text not null default 'new'
    );
    create table public.positions (
      id uuid primary key default gen_random_uuid(), recommendation_id uuid,
      ticker text not null, company_name text, entry_price numeric not null,
      position_size numeric, current_stop numeric, target_1 numeric, target_2 numeric,
      status text not null, execution_metadata jsonb
    );
    create table public.recommendation_snapshots (
      id text primary key, recommendation_id text, status text not null default 'visible',
      was_taken boolean not null default false, linked_position_id text, updated_at timestamptz not null default now()
    );
  `);
  psql(migration);
  psql(`
    insert into public.recommendations(id, ticker, company_name)
      values ('11111111-1111-4111-8111-111111111111', 'AAPL', 'Apple');
    insert into public.recommendation_snapshots(id, recommendation_id)
      values ('snapshot-success', '11111111-1111-4111-8111-111111111111');

    select * from public.app_open_position_transaction(
      '11111111-1111-4111-8111-111111111111', 'AAPL', 'Apple', 100, 2, 95, 110, 120,
      '{"source":"test"}'::jsonb, 'application_open_position_v1'
    );
    do $$ begin
      if (select count(*) from public.positions where recommendation_id = '11111111-1111-4111-8111-111111111111') <> 1
        or (select status from public.recommendations where id = '11111111-1111-4111-8111-111111111111') <> 'taken'
        or (select linked_position_id is null from public.recommendation_snapshots where id = 'snapshot-success')
      then raise exception 'success state was not committed'; end if;
    end $$;

    select * from public.app_open_position_transaction(
      '11111111-1111-4111-8111-111111111111', 'AAPL', 'Apple', 100, 2, 95, 110, 120,
      '{"source":"test"}'::jsonb, 'application_open_position_v1'
    );
    do $$ begin
      if (select count(*) from public.positions where recommendation_id = '11111111-1111-4111-8111-111111111111') <> 1
      then raise exception 'idempotency created a duplicate'; end if;
    end $$;

    insert into public.recommendations(id, ticker, company_name)
      values ('22222222-2222-4222-8222-222222222222', 'MSFT', 'Microsoft');
    create function public.fail_taken_update() returns trigger language plpgsql as $$ begin
      if new.id = '22222222-2222-4222-8222-222222222222'::uuid then raise exception 'forced recommendation failure'; end if;
      return new;
    end $$;
    create trigger force_taken_update before update on public.recommendations
      for each row execute function public.fail_taken_update();
    do $$ begin
      perform public.app_open_position_transaction(
        '22222222-2222-4222-8222-222222222222', 'MSFT', 'Microsoft', 100, 2, 95, 110, 120,
        null, 'application_open_position_v1'
      );
      raise exception 'expected forced failure';
    exception when others then
      if sqlerrm = 'expected forced failure' then raise; end if;
    end $$;
    do $$ begin
      if (select count(*) from public.positions where recommendation_id = '22222222-2222-4222-8222-222222222222') <> 0
        or (select status from public.recommendations where id = '22222222-2222-4222-8222-222222222222') <> 'new'
      then raise exception 'post-insert rollback failed'; end if;
    end $$;
    drop trigger force_taken_update on public.recommendations;

    insert into public.recommendations(id, ticker, company_name)
      values ('33333333-3333-4333-8333-333333333333', 'NVDA', 'Nvidia');
    insert into public.recommendation_snapshots(id, recommendation_id, linked_position_id)
      values ('snapshot-conflict', '33333333-3333-4333-8333-333333333333', 'other-position');
    do $$ begin
      perform public.app_open_position_transaction(
        '33333333-3333-4333-8333-333333333333', 'NVDA', 'Nvidia', 100, 2, 95, 110, 120,
        null, 'application_open_position_v1'
      );
      raise exception 'expected snapshot conflict';
    exception when others then
      if sqlerrm = 'expected snapshot conflict' then raise; end if;
    end $$;
    do $$ begin
      if (select count(*) from public.positions where recommendation_id = '33333333-3333-4333-8333-333333333333') <> 0
        or (select status from public.recommendations where id = '33333333-3333-4333-8333-333333333333') <> 'new'
      then raise exception 'snapshot-link rollback failed'; end if;
    end $$;

    do $$ begin
      set local role anon;
      perform public.app_open_position_transaction(
        '11111111-1111-4111-8111-111111111111', 'AAPL', 'Apple', 100, 2, 95, 110, 120,
        null, 'application_open_position_v1'
      );
      raise exception 'anon unexpectedly executed RPC';
    exception when insufficient_privilege then null;
    end $$;
  `);
  console.log("Action 652C disposable PostgreSQL transaction and role tests passed.");
} finally {
  try { docker("rm", "-f", container); } catch {}
  rmSync(sqlPath, { force: true });
}
