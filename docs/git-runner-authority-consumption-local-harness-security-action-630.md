# Action 630 - Local Harness Security Plan

## Security Objective

The future local database validation must prove the Action 622 storage migration and Action 626 RPC migration execute correctly inside a disposable local database while preserving a hard boundary from every production, staging, preview, developer, or linked Supabase database.

Action 630 performs planning and discovery only. No database was started, no database connection occurred, no migration was applied, and no SQL was executed against Postgres.

## Threat Model

Primary risks:

- accidental remote Supabase contact;
- accidental use of `.env` database URLs or Supabase credentials;
- accidental use of a linked Supabase project;
- applying repository-wide migrations and hitting unrelated missing history;
- leaving local containers, volumes, ports, or temp migration copies behind;
- treating migration-owner success as client-role authorization;
- retaining sensitive connection evidence;
- claiming database validation before SQL is executed.

## Tooling Posture

Safe discovery found:

- global Supabase CLI: `/opt/homebrew/bin/supabase`, version `2.107.0` when run with disposable temp HOME;
- Docker CLI: `/usr/local/bin/docker`, version `29.6.1`;
- no `podman`;
- no host `psql`;
- no host `pg_isready`;
- no repository `supabase/config.toml`;
- no Compose file or Dockerfile;
- no database package scripts;
- no existing database driver dependency.

The Supabase CLI attempted to write telemetry under the normal home directory during version discovery. Future use must isolate `HOME` and Supabase config paths.

## Preferred Harness Security Boundary

Preferred harness: disposable plain Postgres container.

Security controls:

- unique Action-scoped container, volume, database, roles, and temp directory;
- explicit local-only connection endpoint created by the harness;
- apply only the two reviewed migrations;
- bootstrap only required extension and roles;
- use `ON_ERROR_STOP`;
- no Supabase project link;
- no env-file inheritance;
- no remote migration commands;
- no repository-wide migration replay;
- no production dependency added.

Fallback: Supabase CLI local stack only after a prerequisite Action proves isolated local config, no linked project use, and manual two-migration application without `db reset`.

## Remote-Exclusion Controls

The future harness must fail closed when any of these is present:

- inherited `DATABASE_URL` or Supabase DB URL;
- inherited service-role token, anon key, project ref, or access token;
- linked Supabase project metadata used by the command path;
- non-loopback database host;
- port not selected by the harness;
- pre-existing localhost database accepted as target;
- command that can push, repair, link, list projects, or contact remote services.

Environment variables should be neutralized by name without printing values.

## Missing-Migration Control

The missing historical migration `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` blocks full repository migration replay. The validation harness must avoid repository-wide reset/replay and apply only the Action 622 and Action 626 migrations in a disposable context.

`supabase migration repair` and any local mutation of migration history are rejected.

## Role And Privilege Boundary

Roles to create locally:

- migration owner;
- `anon`;
- `authenticated`;
- optional `service_role` only for negative grant inspection;
- unprivileged test role.

Client-role behavior must be tested with `SET ROLE` or equivalent local-only execution, then reset after each case. Migration-owner behavior must never be described as client access.

## Concurrency Boundary

Concurrency tests must use only the disposable database. Two-session tests should be limited to row-lock/CAS behavior over the reviewed tables and functions. No product process, runner, Git command, repository access, network service, or external database may participate.

## Cleanup Boundary

Cleanup must be exact-label based and Action-scoped. The future harness may remove only its own container, volume, database files, temp migration directory, and selected port allocation. It must not delete unrelated containers, volumes, directories, databases, or processes.

## Evidence Boundary

Retain only bounded proof:

- tool versions;
- Postgres version;
- object counts;
- function signatures;
- pass/fail totals;
- ACL/RLS verdicts;
- concurrency/rollback/read results;
- cleanup result;
- no-remote proof.

Do not retain credentials, tokens, secret-bearing URLs, raw environment dumps, full database dumps, or process listings.

## Approval Gates

Action 631 should implement the disposable Postgres validation harness and include a fail-closed preflight that confirms a safe disposable container/runtime path and SQL execution mechanism without starting production, staging, preview, developer, linked, or pre-existing databases.

A later independent review must inspect harness implementation and database-validation results before any TypeScript storage adapter or runner planning begins.

## Non-Authorizations

This plan does not authorize database execution, migration application, package registration, authority consumption, runtime DB calls, a TypeScript server adapter, Git execution, product process/repository access, API/UI/runner activation, credentials, network, Avanza/trading, staging, deployment, retry, fallback, cache, automatic reissue, reconciliation, or reset behavior.
