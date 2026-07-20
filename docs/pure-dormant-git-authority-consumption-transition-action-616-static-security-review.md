# Action 616 - Static Security and Contract Review of Pure Dormant Git Authority Consumption Transition Contract

## Executive Summary

Action 616 independently reviewed the uncommitted Action 615 pure dormant Git authority-consumption transition package.

Decision: blocked pending remediation.

The package remains pure, dormant, fixture-only, and runtime-unreachable. Validation suites pass, and no Git command, process creation, repository inspection, storage, migration, API, UI, runner, credential, environment, network, Avanza, trading, persistence, staging, deployment, commit, push, or merge behavior was introduced.

The review found four medium contract findings and one low export-surface finding. The medium findings block approval because the transition contract is intended to be the semantic model for a future atomic storage/RPC implementation.

## Scope

Reviewed source and tests:

- `lib/post-trade-pure-dormant-git-authority-consumption-transition-contract-core.ts`
- `tests/e2e/post-trade-pure-dormant-git-authority-consumption-transition-contract.spec.ts`
- Action 615 implementation and checkpoint docs
- final-approved Action 607-612 authority-package contract and tests
- related resolver, revalidation, direct-spawn, compatibility, aggregate, observation, parser, completion, neutralization, composition, Action 533, authorization, credential, CLI, and process-executor suites

This review did not implement behavior and did not add tests.

## Findings

| ID | Severity | Area | Finding | Evidence | Required remediation | Approval impact |
| --- | --- | --- | --- | --- | --- | --- |
| A616-MED-001 | Medium | Authority package prerequisite validation | The transition contract accepts a structurally fingerprinted authority-package result but does not semantically revalidate every authority/security and package-field invariant required by the final authority-package contract. | `validateAuthorityPackageResult` checks only selected result fields at `lib/post-trade-pure-dormant-git-authority-consumption-transition-contract-core.ts:856`; `validatePackage` omits explicit checks for many allowed/denied package authorities, linkage fields, freshness/expiry policy fields, and stage-grant semantic fields at `:881`. | Add complete semantic prerequisite validation independent of fingerprint correctness. Recomputed contradictory package/result fingerprints must still reject. | Blocking |
| A616-MED-002 | Medium | Current-state schema closure | `currentState.stages` is validated by length and `every`, but the exact-array helper is not applied. Sparse arrays or arrays with extra own properties can be accepted if the caller recomputes the exported current-state fingerprint. | Length check at `:957`; `every` validation at `:963`; no `isExactArray(candidate.stages, ...)`. Existing sparse-array test asserts stale fingerprint rejection only at `tests/e2e/post-trade-pure-dormant-git-authority-consumption-transition-contract.spec.ts:627`. | Apply exact-array closure to `currentState.stages` and any nested arrays in accepted current state. Add recomputed-fingerprint array-attack tests. | Blocking |
| A616-MED-003 | Medium | State-machine invariants and transition ordering | Current-state validation does not fully prove state-specific invariants, and completion does not require `stageIndex === currentStageIndex`. Contradictory states can pass with recomputed fingerprints and then transition in unsupported order. | State checks are partial at `lib/...transition-contract-core.ts:970`; completion reads `state.stages[input.stageIndex]` without current-stage equality at `:668`; terminal failure can be requested from any consumed count at `:728`. | Enforce exact state invariants for issued, active, partially consumed, consumed, failed, ambiguous, expired, and revoked states; enforce prefix stage progression; require completion of the current consumed stage only; reject terminal failure/ambiguous states without matching stage evidence. | Blocking |
| A616-MED-004 | Medium | Audit event and state linkage | Permitted transitions build one audit event, store its fingerprint in next state, then return a second audit event over the updated state. The returned `nextState.lastAuditEventFingerprint` can therefore differ from the returned audit event. Stage-completion audit linkage also uses the next state's advanced `currentStageIndex`, not the completed stage. | Two-pass audit/state construction at `:1003`; final audit return at `:1017`; stage index derived from next state at `:1081` and `:1108`. | Make audit fingerprint linkage exact and single-valued. Returned next state must reference the returned audit event. Audit stage linkage must identify the operation's actual stage, not the post-transition cursor. | Blocking |
| A616-LOW-001 | Low | Export surface | The production core exports a generic test hash helper with caller-supplied domain and input. It is inert, but broader than the narrow fixture/fingerprint helpers needed for the contract. | `sha256ForDormantGitAuthorityTransitionTest(domain, input)` at `lib/...transition-contract-core.ts:1283`. | Remove or narrow the helper unless a focused test need requires it. Keep only approved deterministic fixture helpers. | Non-blocking after medium remediation |

## Review Gate Verdicts

Pure boundary: pass. The core imports deterministic crypto and approved pure helpers only. No `server-only`, filesystem, process, environment, network, credential, storage, timer, runner, or runtime primitive is imported by production code.

Identities and policies: pass with residual review dependency. The contract, boundary, transition policy, replay, concurrency, terminal-state, audit-event, and compare-and-set policy identities are exact and immutable.

Authority-package revalidation: blocked by A616-MED-001. The package fingerprint is checked, but semantic validation is incomplete for the final-approved authority package vocabulary.

Current-state schema: blocked by A616-MED-002. Exact record closure is strong, but nested `stages` array closure is incomplete.

State enum and invariants: blocked by A616-MED-003. The enum is closed, but state-specific invariant coverage is incomplete.

Operation union: pass. The operation union is closed and there is no generic `update_state` operation.

Registration: blocked pending A616-MED-001. Deterministic consumption-key linkage exists, but prerequisite package validation is incomplete.

Claim: pass with timestamp limitation. Consumer ID/fingerprint and issued-state checks exist; broader timestamp monotonicity should be covered by A616-MED-003 remediation.

Stage consumption: pass with state-invariant dependency. It enforces current stage order and one-shot stage consumption, but relies on current-state invariants that are incomplete.

Stage completion: blocked by A616-MED-003 and A616-MED-004. Completion can target a consumed stage that is not the current stage if malformed state passes validation, and audit stage linkage can point at the advanced cursor.

Detached branch handling: pass for direct operation behavior. `accepted_detached_observation` is limited to stage 3. It still depends on state-invariant closure.

Aggregate finalization: pass for direct operation behavior. It requires all six consumed/completed accepted stages and an aggregate fingerprint before expiry.

Expiry and revocation: pass for direct operation behavior. Expiry and revocation terminalize non-terminal states only and do not create runtime authority.

Failure terminalization: blocked by A616-MED-003. Explicit failure terminalization does not require complete matching stage-failure evidence.

CAS model: pass as a pure model only. Expected transition version and current-state fingerprint are checked. No atomicity or replay safety exists without future storage.

Result union and reasons: pass with audit dependency. The result union is closed and non-authoritative, but permitted audit linkage needs remediation.

Reason precedence: pass for observed tests, with no approval override. The source applies deterministic parser, identity, state, version, terminal, expiry, and operation-specific ordering.

Audit event: blocked by A616-MED-004.

Timestamp model: partial. Timestamp grammar is exact and expiry is fixed at 30000 ms, but future remediation should tighten monotonic transition timestamps.

Schema closure: blocked by A616-MED-002 and A616-MED-003.

Fingerprint coverage: partial. Fingerprints bind major state/result/audit fields, but semantic fingerprint correctness is currently necessary and too close to sufficient for malformed states and package prerequisites.

Determinism and immutability: pass. Outputs are deeply frozen and deterministic for valid inputs.

Test coverage and quality: partial. The 43 focused tests cover the happy path and many rejections, but they do not catch recomputed-fingerprint state-array attacks, complete package semantic forgeries, or audit linkage mismatch.

Atomicity and replay limits: pass as explicit limitations. No atomic storage, replay prevention, or live authority consumption exists.

Export surface: low finding A616-LOW-001.

Runtime reachability: pass. Static scan found only the new core, its focused test, and docs/summary references; no app/API/UI/runner/runtime caller.

Prohibited operations: pass. Production core contains no filesystem, process, environment, network, credential, timer, storage, runner, or Git execution primitive.

Migration baseline limitation: pass as unrelated. `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` remains absent, and the migration-static suite fails at import-time read of that pre-existing missing file. Action 615-616 did not modify migrations, persistence, authorization tests, migration imports, or test discovery.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-authority-consumption-transition-contract.spec.ts --reporter=dot`: first sandbox attempt failed with Playwright `EPERM` writing `test-results/.last-run.json`; escalated rerun passed, 43 tests.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-runner-authority-package-contract.spec.ts --reporter=dot`: passed, 155 tests.
- Direct-spawn, executable revalidation, and resolver group: passed, 564 tests.
- Compatibility, generic/Apple parser, orchestrator, aggregate, porcelain, byte-completion, and simple-observation group: passed, 451 tests.
- Neutralization, raw-completion, composition, and process-executor group: passed, 103 tests.
- Action 533 cross-boundary suite: passed, 181 tests.
- Broad credential, CLI, authorization, and persistence-design group without the known missing migration-static file: passed, 555 tests.
- Migration-static baseline check: failed with the known missing `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`; classified unrelated and pre-existing.
- `./node_modules/.bin/eslint lib/post-trade-pure-dormant-git-authority-consumption-transition-contract-core.ts tests/e2e/post-trade-pure-dormant-git-authority-consumption-transition-contract.spec.ts`: passed.
- `git diff --check`: passed.
- Static export-surface review: one low finding for the generic hash helper.
- Static runtime-reachability review: pass, no app/API/UI/runner/runtime caller.
- Static prohibited-operation review: pass for production core; test-only hits are static source reads and forbidden-string assertions.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.

## Non-Authorizations

This review does not authorize Git execution, process creation or observation, repository inspection, authority consumption, atomic replay prevention, storage, SQL, RPC, migration, runner implementation, runtime/API/UI/cron/worker/CLI activation, credentials, environment, network, Avanza/trading, persistence, staging, deployment, commit, push, merge, or deploy.

## Decision

`post_trade_pure_dormant_git_authority_consumption_transition_contract_static_security_review_blocked_pending_remediation`

## Result Status

`post_trade_pure_dormant_git_authority_consumption_transition_action_616_review_completed_blocked`

## Recommended Next Action

Action 617 - Remediate Pure Dormant Git Authority Consumption Transition Review Findings.

No deploy is recommended for Action 616. No commit, push, merge, or deploy occurred.
