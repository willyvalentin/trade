#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const container = `ture-action-652g-${process.pid}`;
const sqlPath = join(tmpdir(), `ture-action-652g-${process.pid}.sql`);
const migrationPath = new URL(
  "../supabase/migrations/20260724001600_create_shared_login_abuse_control.sql",
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

try {
  docker("run", "--rm", "-d", "--name", container, "-e", "POSTGRES_PASSWORD=postgres", "postgres:16-alpine");
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      docker("exec", "-e", "PGPASSWORD=postgres", container, "pg_isready", "-h", "127.0.0.1", "-U", "postgres");
      break;
    } catch {
      if (attempt === 29) throw new Error("PostgreSQL did not become ready");
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  psql("create role anon nologin; create role authenticated nologin; create role service_role nologin;");
  psql(readFileSync(migrationPath, "utf8"));
  psql(`
    do $$ begin
      set local role anon;
      perform public.app_login_abuse_reserve(repeat('a', 64));
      raise exception 'anon unexpectedly executed login limiter';
    exception when insufficient_privilege then null;
    end $$;

    set role service_role;
    select * from public.app_login_abuse_reserve(repeat('a', 64));
    select * from public.app_login_abuse_reserve(repeat('a', 64));
    select * from public.app_login_abuse_reserve(repeat('a', 64));
    select * from public.app_login_abuse_reserve(repeat('a', 64));
    select * from public.app_login_abuse_reserve(repeat('a', 64));
    do $$ begin
      if (select allowed from public.app_login_abuse_reserve(repeat('a', 64))) then
        raise exception 'per-identity limiter admitted a sixth failure';
      end if;
    end $$;
    do $$ begin
      if not public.app_login_abuse_finalize_success(repeat('a', 64)) then
        raise exception 'successful login finalization failed';
      end if;
      if not (select allowed from public.app_login_abuse_reserve(repeat('a', 64))) then
        raise exception 'successful login did not recover one reservation';
      end if;
    end $$;
    do $$ begin
      perform public.app_login_abuse_reserve('not-a-digest');
      raise exception 'malformed digest was accepted';
    exception when others then
      if sqlerrm = 'malformed digest was accepted' then raise; end if;
    end $$;
    do $$
    declare v_identity text;
    begin
      for counter in 1..95 loop
        v_identity := lpad(to_hex(counter), 64, 'b');
        perform public.app_login_abuse_reserve(v_identity);
      end loop;
      if (select allowed from public.app_login_abuse_reserve(lpad('f', 64, 'f'))) then
        raise exception 'global limiter admitted more than 100 reservations';
      end if;
    end $$;
    reset role;
    do $$ begin
      if exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'application_login_abuse_buckets'
          and column_name ~ '(password|token|session|ip)'
      ) then raise exception 'sensitive login-abuse column exists'; end if;
    end $$;
  `);
  console.log("Action 652G disposable PostgreSQL login-abuse tests passed.");
} finally {
  try { docker("rm", "-f", container); } catch {}
  rmSync(sqlPath, { force: true });
}
