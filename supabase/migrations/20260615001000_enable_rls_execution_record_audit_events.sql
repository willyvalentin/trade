-- Enable row-level security for execution-record audit events.
--
-- This migration is intentionally restrictive:
-- - It enables RLS on public.execution_record_audit_events.
-- - It creates no anon/authenticated/client insert, update, or delete policies.
-- - It creates no generic select/read policy.
-- - It grants no client/browser write access.
-- - It creates no writer, route, function, trigger, or service-role client.
--
-- Service-role/server-only writes remain future work and require separate
-- server-only/service-role proof, route/auth proof, generated audit types proof,
-- migration application proof, and RLS/security proof before any writer or route
-- may use this table.
--
-- This file is local until applied in the intended Supabase environment.
-- Applying this migration is separate from proving the remote table/RLS state.

alter table public.execution_record_audit_events
  enable row level security;

comment on table public.execution_record_audit_events is
  'Append-only execution-record audit events table. RLS is enabled by a local migration file with no client write policies. Service-role/server-only writer, route/auth, generated types, migration application, and RLS proof remain separate future blockers.';

-- force row level security is intentionally deferred. It should be considered
-- only after service-role/server-only writer behavior and operational
-- implications are reviewed in the target Supabase environment.
