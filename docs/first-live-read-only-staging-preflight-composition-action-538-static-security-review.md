# Action 538 - Static Security and Contract Review of First-Live Read-Only Staging Preflight Composition Contract

## Executive Summary

Action 538 reviewed the uncommitted Action 537 dormant composition contract and its relationship to the approved Action 534-536 first-live trusted resolver package.

The composition module is pure and dormant from an import and dependency perspective: it imports no filesystem primitive, no `server-only` runtime adapter, no process API, no environment access, no network client, no credential reader, no Supabase client, no persistence helper, and no API/UI/runner entrypoint. Static reachability review found no application route, component, runner, observer, spawn boundary, credential boundary, or live resolver invocation importing or activating the composition contract.

The review is blocked pending remediation. Two high-severity contract findings were identified in the evidence validator and builder surface. Both are about accepted evidence claims, not live side effects. No live resolver was called, no filesystem operation occurred, no process was spawned, no CLI version was collected, and no credentials or environment values were read.

## Scope Reviewed

- `lib/post-trade-first-live-read-only-staging-preflight-composition-contract-core.ts`
- `tests/e2e/post-trade-first-live-read-only-staging-preflight-composition-contract.spec.ts`
- `docs/first-live-read-only-staging-preflight-composition-contract-action-537.md`
- `docs/first-live-read-only-staging-preflight-composition-checkpoint-action-537.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`
- neighboring resolver, fixture resolver, direct-spawn, scoped observer, credential, CLI-version, authorization, execution-boundary, Action 533, and Action 534-536 review contracts by static inspection and focused test execution

## Findings

| ID | Severity | File / Symbol | Finding | Scenario | Required Remediation | Blocks Approval |
| --- | --- | --- | --- | --- | --- | --- |
| A538-H1 | High | `lib/post-trade-first-live-read-only-staging-preflight-composition-contract-core.ts:577`, `:579`, `:581`, `:517-519` | The exported evidence builders can create provenance-valid evidence with `enablesFilesystemAuthority`, `enablesObserverAuthority`, or `enablesNetworkAccess` set to `true`, and `validateEvidence` does not reject those fields. | A caller using the exported fixture builders can produce frozen, fingerprint-valid, provenance-valid evidence that carries authority-bearing flags while the composition still reaches `composition_complete`. This does not perform live behavior, but it violates the Action 537/538 invariant that every evidence object remains explicitly non-authoritative. | Update validation so every authority flag is required to be false, including filesystem, observer, network, process, credential, and runner authority. Add focused negative tests for each authority flag. | Yes |
| A538-H2 | High | `lib/post-trade-first-live-read-only-staging-preflight-composition-contract-core.ts:331`, `:160`, `:530-533` | The exported resolver evidence builder accepts `observedLiveFilesystem: true`, and the validator does not reject a provenance-valid fixture resolver evidence object carrying that live-observation claim. | A pure composition fixture can mint evidence that appears to claim live filesystem observation without going through the first-live resolver adapter's private live-observation provenance boundary. This reopens an evidence-claim ambiguity that Action 535W/535X explicitly closed for resolver evidence. | Keep composition-built resolver evidence fixture-only by forcing and validating `observedLiveFilesystem: false`, or introduce a separate reviewed live-resolver evidence link type with adapter-private provenance. Add focused tests proving pure composition builders cannot mint live-observed resolver evidence. | Yes |
| A538-M1 | Medium | `tests/e2e/post-trade-first-live-read-only-staging-preflight-composition-contract.spec.ts:99-188`, `:203-212` | The focused Action 537 suite covers many negative paths but does not explicitly test duplicate evidence, ambiguous/extra evidence, wrong version, wrong purpose, wrong tool, wrong platform, all authority flags, or live-observation claims. | Missing coverage allowed A538-H1 and A538-H2 to pass TypeScript and the focused suite. | Add explicit negative tests for every contract invariant listed in Action 538, especially complete evidence-order, authority, live-observation, purpose/version/tool/platform, duplicate, and extra/ambiguous evidence cases. | Yes, because it leaves high-severity contract gaps unguarded |

## Pure And Dormant Boundary Verdict

Pass with respect to reachable behavior. The composition core imports only `node:crypto` and pure/source-controlled contract modules. It does not import filesystem APIs, `server-only`, child process APIs, environment access, network libraries, credential helpers, Supabase clients, browser/session APIs, persistence helpers, or live adapters.

No import-time side effect was found. No API, UI, cron, runner, observer, spawn, credential, trading, Avanza, order, position, settlement, network, persistence, or deployment path imports or invokes the composition contract.

## Identity, Purpose, And Session Verdict

Partially pass. The identity is frozen, versioned, and distinct from the reviewed resolver, spawn, observer, and credential identities. The validator checks session, purpose, platform, tool, operation, version, and fixture/live authority basics. However, A538-H1 and A538-H2 show that authority/live-observation claims are not fully constrained at runtime.

## Evidence Contract Verdict

Blocked. The evidence set requires the intended seven evidence objects in canonical order and rejects missing, duplicate, out-of-order, cloned, mutated, expired, stale, wrong-session, wrong-purpose, wrong-platform, wrong-tool, unsupported-operation, credential-bearing, shell-bearing, retry-bearing, and some runtime-activation evidence. The contract does not yet reject all authority-bearing fields or pure-builder live-observation claims.

## Authority Verdict

Blocked. The final composition result hard-codes every authority field to `none`, but individual evidence objects can still carry unchecked `enablesFilesystemAuthority`, `enablesObserverAuthority`, and `enablesNetworkAccess` claims. Evidence-level authority must fail closed before the contract can be approved.

## TOCTOU Verdict

Blocked. The contract correctly models resolver metadata as point-in-time and requires immediate pre-spawn revalidation, with `toctouEliminated: false`. However, pure composition-built resolver evidence can claim `observedLiveFilesystem: true`, which creates ambiguity about whether the resolver evidence came from fixture construction or a reviewed live adapter.

## Credential Posture Verdict

Pass for explicit credential material fields. No-credential evidence requires no credential material and rejects token, cookie, Keychain, browser state, BankID, Avanza session, and Supabase-authentication flags. Credential authority itself is rejected. No hidden credential access behavior was found.

## Command And Process Plan Verdict

Pass for process non-activation. The direct-spawn plan evidence is structural only, pins argv to `['--version']`, rejects shell syntax, retry, second attempts, unknown operations, execution-started claims, and process-spawned claims. No command string is executed or treated as process authority.

## State Machine Verdict

Pass for side-effect-free determinism, with a naming caveat. Transitions are deterministic and invalid transitions return `blocked`; expiry returns `expired`; cancellation returns `cancelled`. The state named `composition_complete` remains structural only and must not be consumed downstream as runtime readiness.

## Immutability And Fingerprinting Verdict

Partially pass. Identities, policies, evidence, evidence sets, results, and nested arrays/records are frozen. Fingerprints cover the constructed evidence and result objects. Provenance WeakSets reject plain clones. The missing authority/live-observation validations in A538-H1/A538-H2 mean some fingerprint-valid evidence can still encode unacceptable claims.

## Export Surface Review

The production module exports constants, types, fixture evidence builders, the canonical evidence-set builder, the composition validator, the pure composer, and the lifecycle transition helper. It does not export provenance registration or live adapter activation.

## Reachability Review

Static reachability search found the composition contract referenced only by the new production module, the Action 537 focused suite, and Action 537/538 documentation and summary references. No app route, UI component, runner, live resolver adapter, observer, spawn boundary, credential boundary, browser automation, Avanza, order, position, settlement, or deployment path imports it.

## Prohibited Operation Review

The production contract module had no static matches for filesystem APIs, `lstat`, `stat`, process APIs, environment reads, network APIs, credential/Keychain/browser storage access, Supabase clients/writes, Avanza, BankID, persistence, API/UI/runtime wiring, observer invocation, spawn invocation, authorization consumption, trading mutation, or deployment behavior. Test/doc hits were limited to static-inspection helpers and explicit forbidden/rejection vocabulary.

## Validation Summary

Validation commands passed, but the review decision remains blocked because validation did not cover the high-severity contract gaps above.

## Non-Activation Confirmation

Action 538 did not implement new live behavior, did not activate the composition contract, did not call the live resolver, did not perform filesystem access, did not execute git or Supabase, did not collect CLI versions, did not spawn a process, did not use a shell, did not read credentials, did not read environment values, did not access the network, did not invoke observer/spawn/credential/authorization/runner/API/UI paths, did not interact with Avanza, did not change order/position/settlement behavior, did not persist data, and did not deploy.

## Decision

Decision: `post_trade_first_live_read_only_staging_preflight_composition_contract_static_security_review_blocked_pending_remediation`

Result status: `post_trade_first_live_read_only_staging_preflight_composition_contract_action_538_review_completed_blocked`

Recommended next action: Action 538R - Remediate first-live read-only staging preflight composition authority and live-observation evidence validation without activation.
