# Action 541 - Static Security Review of Dormant Server-Only First-Live Composition Adapter

## Executive Summary

Action 541 reviewed the uncommitted Action 540 dormant server-only first-live staging preflight composition adapter and its relationship to the approved first-live trusted resolver and pure composition contracts.

The review found no blocking critical, high, medium, or low findings. The adapter is approved to remain as dormant, unactivated infrastructure for a future separately reviewed staging-preflight chain. Approval does not authorize execution, staging readiness, process spawn, observer work, credentials, CLI-version collection, runtime/API/UI wiring, persistence, deployment, or production use.

## Artifacts Reviewed

- `lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter.ts`
- `lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core.ts`
- `tests/e2e/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter.spec.ts`
- `docs/dormant-server-only-first-live-composition-adapter-action-540.md`
- `docs/dormant-server-only-first-live-composition-adapter-action-540-checkpoint.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`
- `lib/post-trade-first-live-trusted-resolver-adapter.ts`
- `lib/post-trade-first-live-trusted-resolver-adapter-core.ts`
- `tests/e2e/post-trade-first-live-trusted-resolver-adapter.spec.ts`
- `lib/post-trade-first-live-read-only-staging-preflight-composition-contract-core.ts`
- `tests/e2e/post-trade-first-live-read-only-staging-preflight-composition-contract.spec.ts`
- Action 534 through Action 539 resolver, composition, re-review, and planning documents.

## Findings

| ID | Severity | File / Symbol | Finding | Scenario | Required Remediation | Blocks Approval |
| --- | --- | --- | --- | --- | --- | --- |
| A541-I1 | Informational | `lib/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter-core.ts:106`, `:155`, `:171` | The pure core exposes an injected dependency seam for tests. This seam can model resolver behavior and provenance in tests, but it cannot access the production resolver private WeakSet and all successful output remains non-authoritative. | A future production caller could import the pure core and supply fake dependencies, creating non-authoritative neutral composition output without production provenance. Current reachability review found no such caller, and the result grants no filesystem, spawn, observer, credential, runner, API, UI, trading, persistence, or deployment authority. | Keep the seam test-only/dormant. Any future production import of the pure core must receive separate static review and must not substitute for the server-only wrapper. | No |

Critical: 0

High: 0

Medium: 0

Low: 0

Informational: 1

## Server-Only Verdict

Approved.

The server-only wrapper has `import "server-only";` as the first effective import. It imports only the approved first-live trusted resolver wrapper and the pure Action 540 core. It has no module-level resolver call, no evidence capture, no mutable live singleton, and no runtime wiring.

The pure core imports no `server-only`, no live resolver wrapper, and no filesystem, process, environment, network, credential, API, UI, runner, observer, spawn, persistence, or deployment primitive. Directly importing the pure core cannot invoke the live resolver or verify production private provenance by itself.

No client-compatible shared module or application route re-exports or imports the server-only adapter.

## Private-Provenance Verdict

Approved.

Production private provenance remains owned by the approved resolver wrapper through a non-exported `WeakSet`. The Action 540 server-only adapter passes the approved `hasFirstLiveTrustedResolverLiveFilesystemProvenance` verifier directly into the pure core.

The verifier is a boolean oracle over object identity only. It does not expose the WeakSet, a symbol, a token, a brand, a hash, or a serialization format. It cannot make a reconstructed object valid. Spread clones, JSON clones, structured clones, copied fingerprints, stale/expired requests, cross-session requests, cross-tool requests, boundary mismatches, policy mismatches, platform mismatches, authority claims, and malformed metadata fail closed.

The test suite uses a separate test WeakSet against pure-core helpers. That test seam cannot mint production-valid resolver provenance because it never touches the production resolver WeakSet or server-only wrapper.

## Production API Verdict

Approved.

The production wrapper accepts only a trusted resolver request for composition or a verified original resolver result for neutralization. It does not accept caller policy, caller filesystem implementation, caller candidate paths, arbitrary candidate lists, dependency injection, arbitrary metadata, authority objects, commands, or generic production test seams.

The pure core exposes dependency injection for tests, but it is not imported by runtime paths and it does not create authority-bearing output.

Supported tools and platform remain governed by the approved resolver contract: `git`, `supabase_cli`, and macOS policy handling from the resolver boundary.

## Resolver Invocation Verdict

Approved.

The wrapper can invoke only `resolveFirstLiveTrustedExecutable` from the reviewed first-live resolver adapter. There is no resolver selection input, fallback resolver, retry loop, second attempt, PATH discovery, environment override, or caller candidate-path path.

Resolver requests are validated by the existing trusted resolver request validator before invocation. Resolver failures remain deterministic and non-authoritative.

Action 540 adds no filesystem access beyond the already reviewed resolver boundary.

## Neutralization Verdict

Approved.

Neutralized metadata is limited to exactly:

- `deviceId`
- `inode`
- `sizeBytes`
- `mode`
- `modifiedTimeMs`

The core requires the original resolver result metadata to include exactly those five fields plus `changedTimeMs`, but `changedTimeMs` is not emitted into composition metadata. Private provenance, WeakSet identity, verifier references, symbols, tokens, live objects, and `server_only_lstat` do not enter the neutral composition result.

`observedLiveFilesystem` is forced to `false` in the composition evidence. The neutral result is deeply frozen and SHA-256 fingerprinted. Fingerprints bind the neutral fields but do not imply live provenance.

## Authority Verdict

Approved.

Successful neutralization grants no downstream permission. All authority fields remain `none` or `false`, including filesystem, spawn, observer, credential, CLI execution, runner, authorization consumption, network, API, UI, trading, Avanza, deployment, process-spawn, shell, credential access, network access, CLI-version collection, and authorization-consumption fields.

Final authority `none` cannot mask authority-bearing resolver evidence because the core rejects resolver result and evidence authority flags before composition.

## TOCTOU Verdict

Approved.

Resolver evidence remains point-in-time metadata. Action 540 does not claim permanent executable integrity and does not perform immediate pre-spawn revalidation.

The adapter preserves:

- `toctouEliminated: false`
- `immediatePreSpawnRevalidationRequired: true`
- composition evidence requiring future revalidation before any spawn boundary

Path, tool, policy, session, platform, and neutral metadata remain available for a future separately reviewed revalidation boundary. No fingerprint is presented as complete TOCTOU protection.

## Test-Seam Verdict

Approved with informational note A541-I1.

The focused test suite does not import the server-only wrapper at runtime. It imports the pure core and uses a test-only WeakSet to model original-object provenance. Static assertions verify that the production wrapper supplies the approved resolver and production provenance verifier.

The production API was not widened for tests. Tests do not inject policy or filesystem into production and do not depend on actual installed `git` or `supabase` paths. The test seam cannot mint production-valid private provenance.

Coverage materially includes server-only import closure, original-object acceptance, clone rejection, malformed/caller-extended input rejection, private provenance absence, exact neutral metadata schema, authority-free output, deep freezing, deterministic fingerprints, TOCTOU limits, static prohibited operations, and runtime unreachability.

Material coverage gaps requiring remediation: none.

## Export Surface

The server-only wrapper exports the production composition entrypoint, the production original-result neutralization entrypoint, and the pure core exports through a server-only guarded path.

The pure core exports identity, policy, types, `composeDormantServerOnlyFirstLiveStagingPreflightCore`, and `neutralizeOriginalFirstLiveResolverResultCore`. It exports no filesystem primitive, live resolver, provenance registration function, WeakSet, secret, token, brand, runner hook, API route, observer/spawn/credential invocation, or authority-upgrade function.

## Reachability

Static reachability review found references only in:

- the Action 540 server-only wrapper and pure core;
- the Action 540 focused test;
- Action 540 and Action 541 documentation;
- the continuation summary.

No application route, API handler, UI/client component, cron/scheduled job, orchestrator, runner, observer boundary, spawn boundary, credential boundary, authorization module, CLI module, trading module, browser automation, Avanza automation, persistence path, deployment path, or barrel export invokes the adapter.

## Prohibited Operations

No new reachable use was found for:

- `child_process`, `spawn`, `exec`, `execFile`, shell, or process-start APIs;
- `process.env`, PATH lookup, or environment access;
- network libraries or `fetch`;
- credentials, Keychain, cookies, browser state, BankID, Avanza, or Supabase authentication;
- Supabase writes, persistence, storage, RPC, insert, update, upsert, or delete operations;
- timers or signals used for execution;
- API/UI activation, observer invocation, spawn invocation, authorization consumption, trading/order/position/settlement mutation, or deployment behavior.

The only static match in the new production modules was `JSON.stringify` used for deterministic canonical fingerprint construction.

## Non-Authorization Statement

This approval does not authorize:

- immediate pre-spawn revalidation;
- process spawn;
- process observation;
- CLI execution;
- CLI-version collection;
- credentials;
- environment reads;
- network access;
- runner/API/UI activation;
- Avanza interaction;
- order or position behavior;
- settlement retrieval;
- persistence;
- deployment.

## Decision

Decision: `post_trade_dormant_server_only_first_live_staging_preflight_composition_adapter_static_security_review_approved`

Result status: `post_trade_dormant_server_only_first_live_staging_preflight_composition_adapter_action_541_review_completed`

Recommended next action: Action 542 - Plan Immediate Pre-Spawn Revalidation Boundary for First-Live Read-Only Staging Preflight.
