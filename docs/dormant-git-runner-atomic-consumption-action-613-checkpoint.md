# Action 613 Checkpoint - Dormant Git Runner Atomic Authority Consumption Plan

## Scope

Action 613 planned the atomic one-shot consumption-record architecture for the final-approved dormant Git runner authority package.

No consumption contract, database migration, persistence adapter, dormant Git runner, authority consumption, Git execution, process creation or observation, repository inspection, runtime/API/UI/cron/worker/CLI reachability, credentials, environment inheritance, network, Avanza/trading behavior, deployment, retry, fallback, caching, automatic reissue, commit, push, merge, or deploy was added.

## Files Created

- `docs/dormant-git-runner-atomic-authority-consumption-action-613.md`
- `docs/dormant-git-runner-atomic-consumption-architecture-action-613.md`
- `docs/dormant-git-runner-atomic-consumption-action-613-checkpoint.md`

## Files Modified

- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Approved Baseline

- Final-approved pure dormant Git runner authority package.
- Six immutable stage grants.
- Fixed 30000 ms expiry.
- Exact `/usr/bin/git`, macOS, sequence, session, worktree, compatibility, resolver, and revalidation linkage.
- Explicit package replay/storage limitations.
- No consumption record, atomic claim, active-consumer lock, stage CAS, replay prevention, persistence schema, storage adapter, runner, runtime caller, Git execution, or live authority consumption exists.

## Selected Architecture

Durable Postgres/Supabase current-state consumption record per authority package, deterministic unique consumption key, atomic compare-and-set transitions, one active consumer, stage consumed before process attempt, stage completion recorded separately, audit append in the same transaction, terminal fail-closed states, no retry/reset, and server-only dormant access.

## Core Decisions

- Persistence boundary: future server-only transactional Supabase/Postgres function or RPC.
- Uniqueness: deterministic key from package ID and package fingerprint; package ID and package fingerprint remain immutable and conflict-checked.
- Registration: required before any stage consumption; duplicate registration rejects.
- State model: `issued`, `active`, `partially_consumed`, `consumed`, `failed_consumed`, `expired`, `revoked`.
- Active consumer: one persistent claim with numeric lease deferred.
- Stage boundary: durable stage consumption must commit before process creation.
- CAS model: state, consumer, stage, transition version, expiry, revocation, retry, and fallback predicates enforced atomically.
- Process linkage: future direct spawn must require exact matching stage-consumption evidence.
- Completion model: completion recorded after process attempt; next stage waits for accepted prior completion except approved detached branch observation.
- Crash posture: fail closed; consumed stages never reopen; no automatic retry or replay.
- Privacy: store only states, counts, reasons, identifiers, timestamps, and fingerprints.

## Migration Assessment

The absent `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` targets the older staging execution-authorization consumption table `public.execution_authorization_consumptions`. It is a useful precedent for one-shot compare-and-set, RLS, no-client access, and transactional function design, but it is not reusable as the Git runner authority-consumption schema.

Action 613 creates no migration. The Git runner requires a new versioned schema and transaction design.

## Future Test Strategy

Future tests should cover unique registration, duplicate registration, ID/fingerprint conflict, fingerprint reuse, consumer claim, concurrent claim, exact stage order, stage consumed once, stale transition version, wrong consumer, expiry, revocation, durable consumption before process attempt, crash ambiguity, stage failure terminalization, detached branch continuation, aggregate finalization, no retry/reset, replay, transaction rollback, audit atomicity, privacy, deterministic fingerprints, and no runtime caller.

## Future Gates

Record schema, unique key, registration, consumer claim, CAS transition, stage boundary, process linkage, stage completion, expiry/revocation precedence, crash/ambiguity, replay/concurrency, audit atomicity, privacy/retention, storage authority, RLS/service-role, pure transition contract, migration/RPC, server-only storage adapter, static security review, remediation/final re-review, dormant runner implementation, staging-only trial, runtime activation, and deployment approval.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- Authority-package suite: first sandbox attempt hit known Playwright `EPERM` on `test-results/.last-run.json`; minimal filesystem-escalated rerun passed, 155 tests.
- Direct-spawn, executable-revalidation, executable-resolution, and resolver-security suites: 540 passed.
- Compatibility-policy, generic Git parser, Apple Git parser, and Git-version orchestrator suites: 279 passed.
- Aggregate, porcelain-status, byte-completion, and simple-observation suites: 172 passed.
- Neutralization, raw-completion, direct-spawn, revalidation, composition, and process-executor suites: 135 passed.
- Dormant composition adapter, pure composition, trusted resolver/security, and Action 533 suites: 702 passed.
- Broad dormant/process/credential/CLI/authorization regression excluding the known missing-migration static test: 2591 passed.
- Scoped ESLint on changed TypeScript/JavaScript files: not applicable; Action 613 changed documentation only.
- `git diff --check`: passed.
- Static production-source diff review: passed; no production TS/JS changed.
- Static consumption-architecture, CAS/atomicity, replay/concurrency, crash/ambiguity, privacy/storage-authority, migration-baseline, export-surface, runtime-reachability, and prohibited-operation reviews completed.
- Runtime-reachability scan found no source caller for Action 613 architecture identifiers.
- Prohibited-operation scan over changed Action 613 docs found planning/non-authorization text only, not executable code.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.
- Missing migration baseline check: passed; `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` remains absent.

## Decision

`post_trade_dormant_git_runner_atomic_authority_consumption_plan_ready`

## Result Status

`post_trade_dormant_git_runner_atomic_authority_consumption_action_613_planning_gate_completed`

## Recommended Next Action

Action 614 - Design Atomic Consumption Storage Schema and Transaction Contract.

## Commit And Deploy

No deploy is recommended for Action 613. A source-control checkpoint commit may be considered only after the documentation diff and validation are manually inspected.
