# Action 540 - Dormant Server-Only First-Live Staging Preflight Composition Adapter

## Scope

Action 540 implements a dormant server-only composition adapter for the first-live read-only staging preflight chain.

The adapter may call the reviewed first-live trusted resolver boundary and may accept only the original in-process resolver result object whose private live-filesystem provenance is verified by that boundary. It then neutralizes the resolver result into the existing pure composition contract.

## Files

- Server-only adapter: `lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter.ts`
- Pure core: `lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core.ts`
- Focused tests: `tests/e2e/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter.spec.ts`

## Live Behavior Added

The server-only adapter can invoke only `resolveFirstLiveTrustedExecutable` from the reviewed first-live trusted resolver adapter.

The adapter itself does not inspect filesystem metadata directly. It does not import filesystem APIs. The only live filesystem observation remains inside the previously reviewed resolver boundary.

## Neutralization Contract

The adapter accepts only:

- a valid trusted executable resolution request;
- the original resolver result object produced in the same process;
- private provenance verified by `hasFirstLiveTrustedResolverLiveFilesystemProvenance`;
- resolved, non-authoritative resolver evidence;
- matching session, purpose, request, tool, platform, adapter, policy, and fingerprints;
- metadata containing exactly `deviceId`, `inode`, `sizeBytes`, `mode`, `modifiedTimeMs`, and `changedTimeMs`.

It emits pure composition input with only five resolver metadata fields:

- `deviceId`
- `inode`
- `sizeBytes`
- `mode`
- `modifiedTimeMs`

`changedTimeMs` and the private provenance marker are not emitted into composition evidence.

## Still Forbidden

Action 540 does not authorize or implement:

- immediate pre-spawn revalidation;
- process spawn;
- process observation;
- CLI execution;
- CLI-version collection;
- shell use;
- credential access;
- environment reads;
- PATH discovery;
- network access;
- authorization consumption;
- runner activation;
- API, UI, cron, browser, or Avanza wiring;
- trading, order, position, settlement, persistence, deployment, or production execution.

## TOCTOU Limit

The adapter preserves `toctouEliminated: false` and `immediatePreSpawnRevalidationRequired: true`.

A successful neutralization result is composition evidence only. It is not executable authority and does not prove that the executable will remain unchanged. A future direct-spawn boundary must independently revalidate resolver metadata immediately before any separately reviewed execution attempt.

## Security Shape

- The server-only wrapper has `import "server-only";` as its first effective import.
- The pure core is testable without importing the server-only wrapper.
- The wrapper supplies only the approved live resolver and private provenance verifier.
- Caller-supplied policy, filesystem primitives, candidate paths, metadata, dependency injection, and authority flags are rejected.
- JSON clones, structured clones, spread clones, cross-session requests, cross-tool requests, expired requests, malformed requests, missing private provenance, bad fingerprints, and authority claims fail closed.

## Test Coverage

Focused Action 540 coverage includes:

- identity and policy closure;
- server-only wrapper and pure-core separation;
- original-object private provenance verification via injected provenance in tests and approved live resolver wiring in production;
- neutralized metadata exactness;
- clone and serialization rejection;
- cross-session, cross-tool, expired, malformed, caller-extended, and authority-bearing input rejection;
- immutable deterministic output;
- TOCTOU limitation preservation;
- static prohibited-operation scans;
- no API, UI, runner, observer, spawn, or credential boundary wiring.

## Decision

Decision: `post_trade_dormant_server_only_first_live_staging_preflight_composition_adapter_ready_for_static_security_review`

Result status: `post_trade_dormant_server_only_first_live_staging_preflight_composition_adapter_implemented_not_activated`

Recommended next action: Action 541 - Static Security and Contract Review of Dormant Server-Only First-Live Composition Adapter.
