# Action 543 - Dormant Server-Only Immediate Pre-Spawn Revalidation Adapter

## Summary

Action 543 implements a dormant server-only immediate pre-spawn revalidation adapter for the first-live read-only staging preflight chain.

The adapter performs only one bounded `lstat` operation against the exact canonical absolute path carried by the previously approved dormant composition result. It compares current point-in-time filesystem metadata with the neutral resolver metadata produced by the approved resolver and composition chain.

The result is immutable, deterministic, evidence-only, and non-authoritative.

## Filesystem Behavior Added

Production live behavior is limited to:

- `import "server-only";` as the first effective import in `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts`
- one `lstat` call inside `revalidateDormantServerOnlyImmediatePreSpawn`
- no `lstat` at module import time
- no `stat`, `realpath`, `readFile`, `readdir`, PATH discovery, shell lookup, process spawn, network, environment read, credential access, or file write

The wrapper derives the target path only from `compositionAdapterResult.resolvedAbsolutePath`. It does not accept caller paths, path lists, policy overrides, filesystem implementations, dependency injection, arbitrary metadata, or authority flags.

## Pure Core

`lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core.ts` owns deterministic validation, comparison, fingerprinting, blocking reasons, and immutable result construction.

The pure core imports no filesystem primitive, imports no server-only module, performs no live operation, and grants no authority. Tests use synthetic observation records to exercise comparison behavior without relying on installed Git or Supabase paths.

## Initial Evidence Requirements

The adapter consumes the reviewed dormant composition adapter result:

- adapter identity: `ture.execution.dormant-server-only-first-live-staging-preflight-composition-adapter.server.v1`
- result status: `neutralized_composition_input_ready`
- purpose: `first_live_read_only_staging_preflight`
- platform: macOS
- tool identity: `git` or `supabase_cli`
- resolver policy: `first_live_trusted_executable_resolution_macos_v1`
- canonical composition evidence set with resolver evidence and immediate revalidation requirement
- frozen top-level object and nested evidence
- valid fingerprints
- no authority claims
- unexpired evidence

The adapter fails closed for cloned, spread-cloned, JSON-cloned, structured-cloned, mutated, expired, cross-session, cross-purpose, cross-tool, cross-platform, cross-boundary, malformed, incomplete, or authority-bearing inputs.

## Exact Comparison

The comparison requires exact match for:

- resolved absolute path
- tool identity
- platform
- policy identity and version
- boundary session
- purpose
- `deviceId`
- `inode`
- `sizeBytes`
- `mode`
- `modifiedTimeMs`

The metadata schema intentionally remains the neutral five-field schema carried by the Action 540 composition adapter. `changedTimeMs` is not reintroduced.

## Output Contract

Successful output has:

- `status: "revalidated_non_authoritative_evidence"`
- `immediateRevalidationOccurred: true`
- `exactMetadataMatched: true`
- `pointInTimeOnly: true`
- `toctouEliminated: false`
- `serializedEvidenceReusableAsAuthority: false`
- all authority fields set to `"none"` or `false`
- `processSpawned: false`
- `shellUsed: false`
- `cliVersionCollected: false`
- `credentialAccessed: false`
- `networkAccessed: false`
- `observerInvoked: false`
- `authorizationConsumed: false`
- `retryCount: 0`
- `filesystemAttemptCount: 1`

Failure output has `status: "blocked_fail_closed"` and deterministic blocking reasons. Failure does not trigger retry, fallback path selection, alternate candidate selection, repair, spawn, observer work, credential work, or runner activation.

## TOCTOU Model

The revalidation result is point-in-time only. It does not prove permanent executable integrity and does not eliminate TOCTOU.

The remaining interval before any future process creation must be minimized. A future spawn boundary must consume this revalidation result in the same controlled operation chain and must independently avoid treating serialized or persisted evidence as reusable authority.

## Runtime Unreachability

The adapter remains dormant and test-only reachable. No route, API handler, UI component, runner, cron job, observer boundary, spawn boundary, credential boundary, browser automation, Avanza automation, trading module, order path, position path, settlement path, persistence path, deployment path, or production runtime path imports or invokes it.

## Explicit Non-Events

No executable was run. No CLI version was collected. No process was spawned. No shell was used. No credentials or environment values were read. No network request occurred. No observer, spawn, credential, API, UI, runner, cron, browser, Avanza, order, position, settlement, persistence, or deployment behavior was activated.

## Remaining Blockers Before Process Spawn

- Action 544 static security and contract review of this adapter
- separate direct-spawn design
- separate direct-spawn implementation
- separate static/security review of direct spawn
- separate controlled validation gate
- no credential, observer, runner, API, UI, Avanza, order, position, settlement, persistence, deployment, or production activation without later explicit gates

## Decision

Decision: `post_trade_dormant_server_only_immediate_pre_spawn_revalidation_adapter_ready_for_static_security_review`

Result status: `post_trade_dormant_server_only_immediate_pre_spawn_revalidation_adapter_implemented_not_activated`

Recommended next action: Action 544 - Static Security and Contract Review of Dormant Immediate Pre-Spawn Revalidation Adapter.
