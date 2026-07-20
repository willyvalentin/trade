# Action 621 - Git Runner Authority Consumption Database Security Plan

## Security Decision

Use deny-all table access with fixed SECURITY DEFINER RPCs in a separate future RPC migration. Do not use broad service-role direct table transactions as the primary application path.

Selected posture:

- RLS enabled on all three tables;
- no anon/authenticated/client table policies;
- revoke all table privileges from `anon` and `authenticated`;
- no browser/client Supabase access;
- no public execute grants on RPCs;
- RPCs owned by a controlled database owner role;
- fixed `search_path = public, pg_temp` or stricter reviewed equivalent;
- schema-qualified table references;
- no dynamic SQL;
- no caller-provided table, schema, state, status, reason, policy, or command names;
- no arbitrary JSON state payloads;
- no service-role client in pure modules.

## Table RLS And Grants

Future storage migration must execute:

- `alter table public.git_runner_authority_consumption_records enable row level security;`
- `alter table public.git_runner_authority_consumption_stages enable row level security;`
- `alter table public.git_runner_authority_consumption_audit_events enable row level security;`
- `revoke all privileges on table ... from anon, authenticated;`

Create no permissive policies in v1. `force row level security` remains a target-environment review decision because SECURITY DEFINER ownership and Supabase service behavior must be proven before enabling it.

## RPC Grant Posture

Future RPC migration must:

- create each function as SECURITY DEFINER;
- set fixed search path;
- revoke execute from `public`, `anon`, and `authenticated`;
- grant execute only to the reviewed server-only database role or operational role selected for the storage adapter;
- document owner role and rotation expectations;
- avoid grants to client roles.

If repository conventions cannot express a narrower server role than `service_role`, the implementation must document that `service_role` has broad operational power and prove that no generic table-write adapter or runtime caller is introduced.

## SECURITY DEFINER Rules

Every future mutating function must:

1. validate exact scalar input grammar before lookup;
2. lock the package row with `select ... for update`;
3. lock the relevant stage row for stage operations;
4. enforce transition-version CAS;
5. apply closed state, reason, consumer, stage, expiry, revocation, and terminal predicates;
6. update package/stage rows;
7. insert exactly one audit event;
8. return a closed result.

No function may use dynamic SQL, unqualified object names, caller-selected enum/status/reason strings outside CHECK-backed values, exception text passthrough, broad JSON patching, implicit retry, fallback, cache substitution, or automatic reissue.

## Audit Atomicity

State mutation and audit insertion must happen in the same transaction. If audit insertion fails, the package/stage mutation must roll back. If package/stage mutation fails, no permitted audit event may be inserted.

Apply the Action 619-620 acyclic fingerprint model:

- persist `next_state_core_fingerprint`;
- persist canonical `event_fingerprint`;
- persist final `next_state_fingerprint`;
- do not claim SQL recomputes cryptographic fingerprints unless a later reviewed extension implements it.

Recommended v1 posture: application pure contract computes canonical fingerprints, RPC stores and checks semantic/linkage fields atomically, and SQL-side cryptographic recomputation is deferred to a separate review.

## Concurrency And Ambiguity

Concurrency model:

- row locks, unique constraints, and transition-version CAS provide one-winner semantics;
- no application-only lock;
- no advisory lock in v1 unless separately justified;
- one concurrent claimant/stage consumer/finalizer wins;
- losers receive deterministic closed reasons;
- ambiguous commit results are not retried blindly.

If a database response is lost after a possible commit, the only permitted continuation is immutable read-back through `read_git_runner_authority_consumption_state`. If read-back cannot prove a single exact state, authority remains unusable.

## Privacy

The schema and RPCs may store only:

- identities;
- versions;
- package/stage/audit IDs;
- fingerprints;
- closed states/reasons/statuses;
- counters;
- timestamps;
- stage indexes;
- consumer IDs/fingerprints.

They must not store raw executable paths, raw Git output, porcelain filenames, repository paths, process handles, PIDs, environment values, credentials, SQLSTATEs, constraint names, SQL text, stack traces, Node errors, or arbitrary caller metadata.

## Static Review Gates

Future schema review must verify:

- exact migration names;
- exact tables/columns/types;
- no JSON current state;
- CHECK closure for text values;
- SHA-256 checks;
- FK/unique/index inventory;
- RLS enabled;
- grants revoked;
- no RPCs in schema-only migration;
- no unrelated table edits.

Future RPC review must verify:

- exact function names/signatures;
- SECURITY DEFINER and fixed search path;
- no dynamic SQL;
- no client grants;
- row locks and CAS;
- audit append in same transaction;
- closed error mapping;
- search-path attack resistance;
- no raw errors;
- no runtime caller.

## Operational Non-Readiness

This security plan does not make the system database-ready, atomic, replay-safe, repository-inspection-ready, Git-compatible, runtime-ready, staging-ready, execution-ready, observer-ready, credential-ready, Avanza-ready, deployment-ready, or production-ready.
