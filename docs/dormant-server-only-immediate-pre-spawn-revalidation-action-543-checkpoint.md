# Action 543 Checkpoint - Dormant Server-Only Immediate Pre-Spawn Revalidation Adapter

## Scope

Action 543 implemented the smallest dormant server-only immediate pre-spawn revalidation adapter. It added one server-only wrapper capable of one bounded `lstat` operation and one pure core for deterministic comparison and evidence construction.

The action did not execute a process, collect CLI versions, activate observer/spawn/credential/API/UI/runner behavior, or deploy.

## Files Created

- `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts`
- `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core.ts`
- `tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts`
- `docs/dormant-server-only-immediate-pre-spawn-revalidation-adapter-action-543.md`
- `docs/dormant-server-only-immediate-pre-spawn-revalidation-action-543-checkpoint.md`

## Production API

`revalidateDormantServerOnlyImmediatePreSpawn(input)` accepts only:

- `compositionAdapterResult`
- optional `evaluatedAt`

It does not accept caller paths, path lists, policy overrides, filesystem implementations, dependency injection, arbitrary metadata, arbitrary authority flags, environment input, PATH input, or external configuration.

## Provenance Model

The adapter requires the reviewed Action 540 dormant composition result shape, frozen object state, canonical composition evidence validation, valid fingerprints, same session/purpose/tool/platform linkage, resolver policy linkage, and no authority claims.

Plain reconstructed evidence, JSON clones, spread clones, structured clones, mutated evidence, expired evidence, and authority-bearing evidence fail closed.

## Lstat Behavior

The server-only module imports `lstat` from `node:fs/promises`. It calls `lstat` only during the explicit revalidation function and only against the resolved absolute path from the approved composition result.

No other filesystem primitive is introduced.

## Comparison Model

Exact match is required for:

- path
- tool
- platform
- policy identity/version
- session
- purpose
- `deviceId`
- `inode`
- `sizeBytes`
- `mode`
- `modifiedTimeMs`

Any mismatch fails closed.

## One-Shot Model

The policy allows one filesystem attempt, zero retries, no fallback path, and no alternate candidate. Revalidation evidence remains non-authoritative and cannot be reused as spawn permission.

## Test Seam

Tests use synthetic observation records through the pure core. Production does not expose filesystem injection, path injection, or policy injection.

## Validation

Initial validation completed:

- `./node_modules/.bin/tsc --noEmit` passed.
- `./node_modules/.bin/eslint lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core.ts lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts` passed.
- `npx playwright test tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts --reporter=dot` passed, 15 tests.

Full Action 543 validation remains recorded in the final action report.

## Security Assertions

- No executable was run.
- No CLI version was collected.
- No process was spawned.
- No shell was used.
- No credentials or environment values were read.
- No network request occurred.
- No observer, spawn, credential, API, UI, runner, cron, browser, Avanza, order, position, settlement, persistence, or deployment behavior was activated.
- No authority was granted.
- TOCTOU is not claimed eliminated.

## Decision

Decision: `post_trade_dormant_server_only_immediate_pre_spawn_revalidation_adapter_ready_for_static_security_review`

Result status: `post_trade_dormant_server_only_immediate_pre_spawn_revalidation_adapter_implemented_not_activated`

Recommended next action: Action 544 - Static Security and Contract Review of Dormant Immediate Pre-Spawn Revalidation Adapter.
