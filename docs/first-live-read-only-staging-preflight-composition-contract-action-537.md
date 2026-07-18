# Action 537 - Dormant First-Live Read-Only Staging Preflight Composition Contract

## Summary

Action 537 adds a pure, fixture-only composition contract for the future first-live read-only staging preflight chain. The contract describes how reviewed resolver evidence, immediate pre-spawn revalidation requirements, direct-spawn plan evidence, scoped observer plan evidence, no-credential evidence, CLI-version evidence expectations, and one-shot authorization lifecycle evidence fit together before any execution-capable boundary is allowed to run.

The contract is dormant. It does not call the first-live resolver adapter, does not perform `lstat`, does not access the filesystem, does not spawn a process, does not collect CLI versions, and does not activate API, UI, runner, observer, spawn, credential, browser, Avanza, order, position, settlement, network, deployment, or trading behavior.

## Files

- `lib/post-trade-first-live-read-only-staging-preflight-composition-contract-core.ts`
- `tests/e2e/post-trade-first-live-read-only-staging-preflight-composition-contract.spec.ts`

## Contract Shape

The composition contract introduces a source-controlled identity:

- `ture.execution.first-live-read-only-staging-preflight-composition.fixture.v1`

It remains distinct from the resolver, direct-spawn, scoped observer, and credential adapter identities. The policy supports only the reviewed read-only preflight tools and operations:

- `git` -> `collect_git_version` -> argv `['--version']`
- `supabase_cli` -> `collect_supabase_cli_version` -> argv `['--version']`

The evidence set is canonical and ordered:

1. trusted resolver evidence link
2. immediate pre-spawn revalidation requirement
3. direct spawn plan link
4. scoped process observer plan link
5. no-credential evidence link
6. CLI-version evidence expectation
7. authorization one-shot lifecycle evidence

Every evidence object is frozen, fingerprinted, session-bound, purpose-bound, expiry-bound, and fixture-only. Module-local provenance stores reject cloned, spread, malformed, cross-boundary, or structurally forged evidence. All evidence-level authority flags must remain false, nested authority-bearing metadata is rejected, and pure composition resolver evidence must remain synthetic/non-live with `observedLiveFilesystem: false`.

## Authority Model

The composition result always keeps current authority at `none` for:

- execution
- filesystem
- spawn
- observer
- credential
- network
- runner
- API
- UI
- trading
- Avanza
- deployment

Fixture completeness is not live authority. Compatibility is not execution permission. A complete composition result only means the pure contract has accepted fixture evidence for future review.

## TOCTOU Boundary

Resolver metadata remains point-in-time fixture evidence only. The contract explicitly requires immediate pre-spawn revalidation and records `toctouEliminated: false`. No claim is made that resolver evidence permanently proves an executable is unchanged. This pure contract does not accept actual live resolver provenance; a future server-only composition boundary must verify original live resolver provenance in-process before live evidence can be composed. A future spawn boundary must independently revalidate resolver metadata immediately before any separately approved execution attempt.

## Fail-Closed Behavior

The validator blocks malformed, missing, cloned, mutated, expired, wrong-session, wrong-purpose, wrong-platform, wrong-tool, wrong-operation, stale, duplicate, out-of-order, credential-bearing, retry-bearing, shell-bearing, runtime-activation, and fixture/live-authority-confused evidence.

Resolver metadata is closed-schema fixture metadata. Unknown keys, nested objects, nested authority structures, symbols, inherited properties, accessors, prototype-pollution keys, class instances, arrays, null, functions, non-finite numbers, malformed types, and alternate semantic aliases are rejected with `resolver_metadata_schema_rejected`.

The lifecycle helper is deterministic and fail closed: invalid state transitions return `blocked`; expiry events return `expired`; cancellation events return `cancelled`.

## Behavior Still Forbidden

Action 537 does not authorize and does not implement:

- live resolver invocation
- `lstat` or other filesystem inspection from the composition contract
- process spawn
- shell use
- CLI execution or version collection
- credential, Keychain, cookie, session, BankID, Supabase auth, or Avanza access
- network access
- authorization consumption
- API, UI, runner, cron, observer, spawn, credential, browser, Avanza, order, position, settlement, trading, or deployment wiring

## Test Coverage

The focused Action 537 suite covers identity separation, immutable policy, canonical evidence ordering, deterministic composition, zero-authority result fields, immediate revalidation requirements, stale resolver metadata rejection, missing evidence rejection, provenance rejection, clone and mutation rejection, wrong-session rejection, expiry rejection, cross-boundary substitution rejection, no-credential posture, exact version-command spawn-plan constraints, lifecycle transitions, static prohibited-operation checks, and API/UI/live-resolver non-wiring.

## Decision

Decision: `post_trade_first_live_read_only_staging_preflight_composition_contract_ready_for_static_security_review`

Result status: `post_trade_first_live_read_only_staging_preflight_composition_contract_implemented_not_activated`

Recommended next action: Action 538 - Static Security and Contract Review of First-Live Read-Only Staging Preflight Composition Contract.
