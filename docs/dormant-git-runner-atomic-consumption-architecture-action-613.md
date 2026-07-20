# Action 613 - Atomic Consumption Architecture

## Selected Architecture

Use a durable Postgres/Supabase-backed semantic consumption record for each final-approved dormant Git runner authority package. The record owns the current package state, active consumer, transition version, stage counters, per-stage consumed fingerprints, terminal state, and audit linkage. Every mutation uses atomic compare-and-set predicates and appends a sanitized audit event in the same transaction.

This architecture is selected because the authority package is immutable and fingerprinted but has no durable uniqueness, no active-consumer lock, no stage state, and no replay protection. Storage is the source of truth for one-shot consumption.

## Transaction Families

Future server-only storage should expose only narrow operations:

1. register package;
2. claim consumer;
3. consume exact stage grant;
4. record stage completion;
5. terminalize failure, expiry, or revocation;
6. finalize aggregate consumption;
7. read current state.

Each operation must accept closed validated evidence and exact expected transition version. No operation accepts raw SQL, arbitrary table names, caller-selected stages, caller-selected reasons, broad JSON, runtime config, credentials, environment values, or process handles.

## Package Registration

Registration validates the final-approved package, derives `consumptionKey`, and creates one `issued` record. Unique constraints should cover:

- consumption key;
- package ID;
- package fingerprint;
- package ID plus package fingerprint.

Duplicate registration is rejected, not treated as success. Package ID/fingerprint conflicts and fingerprint reuse under another package ID are separate rejection outcomes.

## Consumer Claim

A package may have at most one active consumer. The claim transition moves `issued` to `active`, stores consumer ID/fingerprint, claimedAt, lastTransitionAt, claim version, current stage, and transition version. The lease duration is intentionally deferred; the package lifetime is 30 seconds but is not automatically a safe lease.

Second consumers, wrong consumers, stale claim versions, terminal packages, expired packages, and revoked packages reject.

## Stage Consumption

A stage is consumed before process creation. Atomic predicates:

- record/package/policy/consumer identity matches;
- state permits stage consumption;
- currentStageIndex equals the expected stage;
- stage is unconsumed;
- transition version matches;
- package is unexpired, unrevoked, and non-terminal;
- retryCount is 0 and fallback is false.

Atomic effects:

- mark stage consumed;
- store stage-consumption and process-attempt request fingerprints;
- advance stage counters;
- increment transition version;
- update state to `partially_consumed` or terminal candidate;
- append audit event.

If this transition fails, the process must not be created. If it succeeds and the process does not start because of crash or infrastructure failure, the stage remains consumed.

## Stage Completion

Completion is a separate transition after the process attempt and evidence construction. It stores completion evidence fingerprint, interpretation fingerprint or null, outcome, reason, completedAt, and next-stage eligibility.

Next stage can begin only after accepted terminal stage evidence, except the approved detached-HEAD branch observation. Rejections terminalize the package as `failed_consumed`; no automatic retry is allowed.

## Aggregate Finalization

Aggregate finalization requires:

- all six stages consumed;
- all required stage completions accepted;
- HEAD-before/HEAD-after evidence available;
- package not expired or revoked before aggregate construction;
- transition version matches;
- active consumer matches.

It records aggregate fingerprint, marks sequence `consumed`, terminalizes the record, and appends an audit event in one transaction.

## Expiry, Revocation, And Precedence

Expiry is checked before registration acceptance where applicable, before claim, before every stage consumption, and before aggregate construction. If expiry wins before a stage starts, no process is created. If a stage was already consumed and started before expiry, completion may be recorded, but no next stage begins. Consumed and failed-consumed states do not later become expired.

Revocation is a terminal transition requiring exact package identity and expected transition version. Race precedence must be enforced in the database transaction, not caller order. Identity and fingerprint failures precede state outcomes; terminal/expiry/revocation precede new consumption.

## Crash And Recovery

Crash posture is fail closed:

- consumed stages never reopen;
- ambiguous process-attempt state records an exact reason and terminalizes or requires manual review;
- database response loss requires read-back by immutable identifiers;
- no blind retry;
- no second operation ID;
- no inferred success;
- no automatic replay;
- no cache substitution.

`failed_consumed` plus reason is sufficient for v1 unless Action 614 proves a separate `ambiguous_failed_consumed` state is needed.

## Audit Model

Every mutation has an audit event appended transactionally with the record mutation. Events store only fingerprints, stage identity/index, transition version before/after, consumer fingerprint, status/reason, and timestamps. They must not store plaintext paths, raw output, porcelain paths, environment, credentials, process handles, raw database errors, Node errors, or stack traces.

Append-only audit without current state is not enough for v1; it can supplement but not replace the current-state record.

## Privacy

The current-state record and audit events store identifiers, timestamps, counters, states, reasons, and fingerprints only. Retention duration is intentionally deferred to a later gate.

## Storage And RLS

Future schema design should follow existing Supabase/Postgres conventions:

- source-controlled migration draft;
- exact columns and constraints;
- RLS enabled;
- no anon/authenticated direct access;
- no client policies;
- no direct table write path for application callers;
- reviewed server-only function/RPC boundary;
- no service-role use from pure modules;
- no raw database errors returned.

## Existing Migration Assessment

`supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` remains absent. Its associated design and static tests target `public.execution_authorization_consumptions`, a staging execution-authorization table. It is a useful precedent but not this Git runner authority-consumption schema.

Action 614 should design a new versioned schema/transaction contract for Git runner package consumption instead of reusing that missing migration filename.

## Rejected Alternatives

- In-memory lock: cannot protect across workers, deploys, or crashes.
- Caller state: turns caller input into authority.
- Generic lock: lacks stage/package semantics.
- Event log only: audit useful, but current-stage CAS becomes indirect and harder to prove.
- Runner-first implementation: would create process authority before durable one-shot enforcement exists.

## Mandatory Constraints For Future Implementation

- `import "server-only";` first effective import for server storage adapters only, not pure contracts;
- no production runtime caller;
- no client import;
- no direct Git execution without consumed-stage proof;
- no process creation before durable stage consumption;
- no retry, fallback, cache, reset, or grant replenishment;
- no generic table-write authority;
- no raw output or paths in storage;
- no service-role credential in pure modules;
- independent static review, remediation, and final re-review before runner implementation.
