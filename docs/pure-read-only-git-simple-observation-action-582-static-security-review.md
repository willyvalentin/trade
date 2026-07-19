# Action 582 - Static Security Review of Pure Read-Only Git Simple Observation Contracts

## Scope

Action 582 independently reviewed the uncommitted Action 581 pure read-only Git observation package:

- `lib/post-trade-pure-read-only-git-observation-completion-contract-core.ts`;
- `lib/post-trade-pure-read-only-git-repository-root-interpretation-contract-core.ts`;
- `lib/post-trade-pure-read-only-git-object-format-interpretation-contract-core.ts`;
- `lib/post-trade-pure-read-only-git-head-object-id-interpretation-contract-core.ts`;
- `lib/post-trade-pure-read-only-git-branch-state-interpretation-contract-core.ts`;
- `tests/e2e/post-trade-pure-read-only-git-simple-observation-contracts.spec.ts`;
- Action 581 documentation and continuation checkpoint.

The review also checked the relevant Action 579 and Action 580 planning documents, pure raw-completion contract, generic and Apple Git-version parsers, dormant neutralization-to-Git-version orchestrator, neutralization, direct-spawn, resolver, composition, revalidation, and Action 533 contracts.

Official Git documentation reviewed:

- `git rev-parse`: `--show-toplevel`, `--show-object-format`, and `--verify`;
- `git symbolic-ref`: `--quiet` and `--short`.

No implementation behavior was changed. No tests were added. No porcelain-status contract, Git runner, repository-inspection command, process execution, process observation, API/UI/runner wiring, credentials, environment access, network access, Avanza/trading behavior, persistence, deployment, commit, push, merge, or deploy was added.

## Executive Verdict

The Action 581 modules are pure and runtime-unreachable, but the package is not approved yet.

Decision:

`post_trade_pure_read_only_git_simple_observation_contracts_static_security_review_blocked_pending_corrections`

Result status:

`post_trade_pure_read_only_git_simple_observation_contracts_action_582_review_completed_blocked`

Recommended next Action:

Action 583 - Remediate Pure Read-Only Git Simple Observation Contract Review Findings.

## Findings

| ID | Severity | File / Lines | Finding | Failure Scenario | Required Remediation | Approval Impact |
| --- | --- | --- | --- | --- | --- | --- |
| A582-MED-001 | Medium | `lib/post-trade-pure-read-only-git-observation-completion-contract-core.ts:385-405` | `validateGitObservationCompletionResult` verifies exact top-level keys, capability identity, evidence fingerprint, and result fingerprint, but it does not revalidate all evidence security fields. A caller that can recompute exported fingerprints can forge accepted completion evidence with contradictory fields such as `observedLiveProcess:true`; downstream parsers accept it as input and then return neutral output. | A synthetic review probe changed accepted completion evidence to `observedLiveProcess:true`, recomputed evidence/result fingerprints with exported helpers, and `buildPureGitRepositoryRootInterpretation` returned `accepted_fixture_git_repository_root`. | Add full accepted-completion evidence validation before downstream parser use: evidence kind/version/contract identity, contract and policy fingerprints, `eligibleCompletion`, command-specific stdout limit, stderr-empty posture, all lifecycle fields, all authority/runtime/live/credential/network/TOCTOU false fields, exact accepted blocking reasons, and exact result/evidence key schemas. Add regression tests for recomputed forged fingerprints. | Blocks approval. |
| A582-MED-002 | Medium | `lib/post-trade-pure-read-only-git-head-object-id-interpretation-contract-core.ts:91-105` | HEAD object-ID interpretation validates object-format evidence fingerprints but does not fully validate object-format result/evidence schema and security posture. It does not require exact result/evidence keys, `resultVersion`, boundary/grammar IDs, `blockingReasons:["accepted"]`, authority/runtime false fields, or absence of unknown fields. | A forged object-format result with recomputed fingerprints and extra or contradictory fields could be accepted as HEAD linkage if the subset of checked fields remains acceptable. | Introduce or reuse a strict object-format result validator that checks exact keys, result/evidence identity, accepted reason/status consistency, all linkage fields, all authority/runtime false fields, and fingerprints. Add HEAD regression tests for extra fields and recomputed forged object-format evidence. | Blocks approval. |
| A582-MED-003 | Medium | `lib/post-trade-pure-read-only-git-repository-root-interpretation-contract-core.ts:123-134`; `tests/e2e/post-trade-pure-read-only-git-simple-observation-contracts.spec.ts:206-224` | Repository-root grammar rejects C0 controls and DEL but not C1 controls. Action 582 required no C0/C1 control characters, and a synthetic probe showed `/repo\u0085x\n` is accepted as a root path. | C1 control text can be accepted into `repositoryRootPath` and fingerprinted as if it were ordinary path evidence. This grants no authority, but it weakens the intended safe display/serialization grammar. | Reject Unicode category `Cc` beyond current C0/DEL handling, or explicitly document and test a narrower non-C1 posture. Add C1 regression tests. | Blocks approval. |
| A582-MED-004 | Medium | `tests/e2e/post-trade-pure-read-only-git-simple-observation-contracts.spec.ts:173-192`, `240-254`, `271-276`, `336-350` | Focused test coverage is useful but incomplete for the requested review gates. Missing or partial areas include exact byte-limit boundary/one-byte-over tests, recomputed forged-fingerprint attacks, schema attacks with extra fields/getters/exotic prototypes, capability-purpose mismatch tests, wrong-policy/source-linkage tests beyond one session mismatch, object-format full schema attacks, branch empty/ref edge cases, and root C1 controls. | Existing tests pass but would not catch A582-MED-001, A582-MED-002, or A582-MED-003. | Add focused regression tests for the missing gates without widening behavior. | Blocks approval because current coverage is not sufficient for the requested review standard. |

## Review Verdicts

Pure-boundary verdict: pass. The production modules import only pure dependencies and `node:crypto`; static scans found no filesystem, process, environment, credential, network, timer, Supabase, Avanza, persistence, or runtime wiring.

Input-boundary verdict: blocked. The builder path is closed, but downstream accepted-result validation is not strict enough against recomputed forged fingerprints.

Capability/argv verdict: pass for source-controlled definitions. Only the four Action 581 tuples are present: `rev-parse --show-toplevel`, `rev-parse --show-object-format`, `rev-parse --verify HEAD`, and `symbolic-ref --quiet --short HEAD`. Porcelain status is not included.

Lifecycle verdict: pass for builder input validation, with detached branch limited to symbolic-ref exit code `1` and empty stdout. Downstream validation gap is captured in A582-MED-001.

Linkage/fingerprint verdict: blocked. Fingerprints are deterministic and cover source fields, but exported recomputation helpers combined with incomplete field revalidation permit forged accepted evidence.

Stderr/normalization verdict: pass. Accepted completion requires empty stderr, no stderr overflow, and no stream errors. Interpretation contracts only remove at most one final LF and do not trim, repair, case-fold, or normalize Unicode.

Repository-root verdict: blocked. It is non-overclaiming about filesystem canonicality and authority, but C1 control characters are accepted.

Object-format verdict: pass for direct parser output grammar; blocked as HEAD input due A582-MED-002.

HEAD linkage verdict: blocked. It requires an object-format result and recomputes fingerprints, but object-format schema/security validation is incomplete.

Branch/detached verdict: pass for current narrow ASCII branch grammar and exact detached outcome.

Result-union verdict: pass for builder-created results; downstream forged input validation remains blocked under A582-MED-001 and A582-MED-002.

Reason-precedence verdict: pass for primary builder flows, with tests asserting representative exact reasons. Coverage gaps remain under A582-MED-004.

Byte-limit verdict: implementation enforces source-controlled byte limits by UTF-8 byte count, but exact-boundary and one-byte-over tests are missing.

Determinism/immutability verdict: pass for builder-created results. Outputs are deeply frozen and contain no internal timestamps.

Authority verdict: pass for builder-created outputs. Accepted output means grammar acceptance only and grants no repository-read, process, observer, CLI-execution, compatibility, runtime, staging, deployment, credential, network, mutation, or authorization-consumption authority.

Parser/status separation verdict: pass. Generic Git-version parser and Apple Git-version parser were not modified; no porcelain-status parser or aggregate runner was added.

Test-quality verdict: blocked by A582-MED-004.

Migration-suite limitation verdict: unrelated baseline limitation. The missing file is `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`; Action 581 did not modify migrations, migration tests, authorization tests, or persistence behavior.

Export-surface result: pass with caution. Exports are constants, types, builders, validators, and pure helpers. No runner, status parser, compatibility helper, trust reset, live provenance helper, or repository authority helper was added. The exported fingerprint helpers increase the importance of strict runtime field validation, captured in A582-MED-001.

Reachability result: pass. Static scans found no app/API/UI/runner caller for the Action 581 modules.

Prohibited-operation result: pass. No prohibited operation is reachable from the new modules. `createHash(...).update(...)` is deterministic SHA-256 hashing only.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- `npx playwright test tests/e2e/post-trade-pure-read-only-git-simple-observation-contracts.spec.ts --reporter=dot`: 44 passed.
- Parser/orchestrator/direct-spawn regression slice: 229 passed.
- Revalidation/composition/resolver/Action 533 regression slice: 731 passed.
- Full `npx playwright test tests/e2e/post-trade-*.spec.ts --reporter=dot`: blocked before execution by missing `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`.
- Broad post-trade suite excluding only the two known missing-migration module-load blockers: 2773 passed.
- `./node_modules/.bin/eslint` on changed TypeScript/test files: passed.
- `git diff --check`: passed.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.
- Static pure-import, input-boundary, exact argv, lifecycle, linkage/fingerprint, stderr/normalization, root, object-format, HEAD, branch, result-union, reason, byte-limit, determinism, authority, parser/status separation, focused-test-quality, export-surface, runtime-reachability, prohibited-operation, and migration-limitation reviews completed.

Playwright emitted existing `DEP0205` and `NO_COLOR` / `FORCE_COLOR` warnings. They were not failures.

## Non-Authorization

This review does not authorize Git repository inspection, process creation or observation, repository-read authority, porcelain-status parsing, Git compatibility decisions, runtime/API/UI/runner activation, credentials, environment or network access, Avanza/trading behavior, persistence, deployment, commit, push, merge, or production readiness.
