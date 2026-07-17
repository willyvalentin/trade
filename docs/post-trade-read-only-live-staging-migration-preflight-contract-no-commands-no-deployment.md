# Post-Trade Read-Only Live Staging Migration Preflight Contract

Action 505 designs the pure contract for a future read-only live staging migration preflight. It does not collect live evidence, run Git, run Supabase, execute SQL, deploy a migration, mutate schema, persist evidence, consume the readiness artifact, or activate API/UI/runtime paths.

## Problem

Action 504 proved structural readiness for the single-use source-controlled staging migration deployment readiness artifact. Structural readiness is not live evidence. A future deployment action still needs fresh, authoritative observations that prove the current local and remote state match the reviewed migration assumptions.

This contract defines that future evidence shape and the fail-closed decision model.

## Binding

- Readiness artifact: `post_trade_single_use_staging_migration_deployment_readiness_001`
- Readiness artifact fingerprint: `8f22f3544c426584587a76b1bec8393ad930c4b9d5d1e0a8b2e710128443630d`
- Migration: `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`
- Reviewed migration fingerprint: `4f4fbfb52a458e502441322bae873940469c89f292db464d177aa10fad9f095a`
- Target staging project: `pdvzyuhykomwfqyyztru`
- Rejected production project: `ekdyopdrrkphlrsilyoo`

## Structural Readiness vs Live Preflight

Structural constants are expected values, not proof. The contract therefore rejects self-asserted evidence and requires future authoritative observations for project identity, worktree state, migration content, migration inventory, remote migration history, remote catalog state, and remote privilege/RLS baseline.

A ready preflight decision remains non-deploying:

- `deploymentEnabled: false`
- `deploymentStatus: not_deployed`
- `remoteMutation: false`
- `sqlExecuted: false`
- `migrationsApplied: 0`
- `rowsCreated: 0`

It may only recommend a separate explicit staging deployment action.

## Collection Session

All observations must share one immutable collection session. The session binds:

- preflight session id
- contract version
- collector version
- collection start/completion time
- host classification without sensitive machine identity
- repository identity and redacted root identity
- readiness artifact id and fingerprint
- migration filename/path/fingerprint
- target staging project
- rejected production project

Mixed sessions block deployment.

## Trust Sources

The contract defines explicit versioned source identities, such as:

- `trusted_readiness_artifact_validator_v1`
- `trusted_local_migration_reader_v1`
- `trusted_local_migration_inventory_reader_v1`
- `trusted_git_status_runner_v1`
- `trusted_git_diff_runner_v1`
- `trusted_supabase_project_status_runner_v1`
- `trusted_supabase_migration_list_runner_v1`
- `trusted_supabase_catalog_reader_v1`
- `trusted_supabase_privilege_reader_v1`

Rejected source identities include `caller`, `manual`, `user`, `expected_constant`, `environment_only`, `self_asserted`, and `unknown`.

## Evidence Categories

The contract models:

- readiness artifact evidence
- local migration content evidence
- Git/worktree evidence
- local migration inventory evidence
- Supabase project-link evidence
- Supabase target-project evidence
- remote migration-history evidence
- remote catalog/schema evidence
- remote privilege/RLS baseline evidence
- collection-session freshness evidence

Every evidence object is exact-object validated and must be complete, authoritative, read-only, fresh, fingerprinted, and tied to the same collection session.

## Project Evidence

Only exact staging identity can pass. Production, alternate, missing, ambiguous, stale, malformed, or conflicting project evidence blocks. Environment-variable presence alone is not authoritative.

## Worktree Evidence

The future preflight must distinguish unrelated worktree changes that are excluded from the deployment unit from unrelated files accidentally included in it. The deployment unit is limited to the reviewed migration path. Unrelated Action 366-369 and Action 318-320 files are explicitly denied from the deployment unit.

## Migration Evidence

The future preflight must verify:

- exact migration path and filename
- regular non-symlink file
- exact reviewed SHA-256 fingerprint
- exact normalized length and statement inventory
- target migration exists exactly once
- proposed deployment unit contains exactly one migration
- no duplicate timestamp/name
- valid ordering

## Remote History and Catalog

Remote migration-history evidence must show the target migration is unapplied and prerequisites are consistent. Already-applied, divergent, unexpected-remote, missing-prerequisite, stale, malformed, or ambiguous history blocks.

Remote catalog evidence must show clean pre-deployment state: target table absent, no conflicting relation/type/view/materialized view/index/policy/function/trigger, referenced dependencies present, public schema references, UUID-compatible PKs, and UUID generation availability.

## Privilege/RLS Evidence

Privilege/RLS evidence must show the current staging privilege model remains compatible with the reviewed migration assumptions. The contract does not claim to eliminate service-role bypass risk; it records that risk as operationally remaining.

## Sanitization

Raw command output is not accepted as authoritative evidence. Future runners should provide sanitized structured observations plus raw-output fingerprints, sizes, parser versions, and sanitization classifications. Tokens, service-role keys, passwords, environment dumps, usernames, home paths, cookies, sessions, and BankID artifacts are rejected.

## Freshness

Chosen maximum evidence lifetimes are intentionally short:

- project identity: 2 minutes
- worktree: 5 minutes
- migration content: 10 minutes
- migration inventory: 10 minutes
- remote migration history: 2 minutes
- remote catalog: 2 minutes
- remote privilege/RLS baseline: 2 minutes
- readiness artifact: 60 minutes

All evidence must still be fresh at the final decision point.

## Ambiguity

Ambiguity never means safe. Timeouts, truncated output, unknown parser versions, incomplete histories, partial catalog observations, missing raw-output fingerprints, and conflicting evidence block deployment. The contract does not recommend blind retry, repair, reset, or history rewriting.

## Future Runner Boundary

The pure plan describes a future runner sequence:

1. load and validate readiness artifact
2. create collection session
3. collect local migration evidence
4. collect local migration inventory
5. collect authoritative worktree evidence
6. collect authoritative project evidence
7. collect remote migration-history evidence
8. collect remote catalog evidence
9. collect privilege/RLS baseline evidence
10. validate evidence envelopes
11. confirm one collection session
12. evaluate final read-only preflight decision
13. emit sanitized report
14. stop without deployment

The future runner may only collect separately reviewed read-only evidence. It must not deploy, push database changes, mutate SQL, seed data, repair migrations, reset schema, create functions, run arbitrary shell commands, persist evidence, or consume the readiness artifact in the same action.

## Files

- `lib/post-trade-read-only-live-staging-migration-preflight-contract.ts`
- `tests/e2e/post-trade-read-only-live-staging-migration-preflight-contract.spec.ts`

## Confirmation

No live Git/Supabase evidence collection, SQL execution, deployment, remote connection, schema mutation, persistence, readiness artifact consumption, adapter invocation, API/UI/runtime activation, Avanza/browser automation, credential/session/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred in this action.
