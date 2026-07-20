# Action 608 - Static Security and Contract Review of Pure Dormant Git Runner Authority Package

## Executive Summary

Action 608 independently reviewed the uncommitted Action 607 pure dormant Git runner authority-package contract.

The implementation remains pure, fixture-only, deterministic, dormant, and runtime-unreachable. It does not execute Git, create or observe processes, inspect repositories, consume authority, prevent replay through storage, activate a runner, access credentials, read environment values, use the network, touch Avanza/trading behavior, persist data, modify migrations, stage, deploy, commit, push, merge, or deploy.

The review is blocked pending remediation. Three findings remain: one high-severity prerequisite semantic revalidation gap, one medium schema-closure gap, and one medium policy-fingerprint coverage gap.

## Scope Reviewed

Reviewed:

- `lib/post-trade-pure-dormant-git-runner-authority-package-contract-core.ts`;
- `tests/e2e/post-trade-pure-dormant-git-runner-authority-package-contract.spec.ts`;
- Action 607 documentation and checkpoint;
- Action 605 authority architecture;
- Action 606 expiry/freshness policy;
- compatibility-policy, aggregate-observation, observation/completion, resolver, revalidation, direct-spawn, neutralization, raw-completion, composition, authorization, process, credential, and Action 533 contracts.

## Findings

| ID | Severity | File / Symbol | Finding | Failure Scenario | Required Remediation | Approval Impact |
| --- | --- | --- | --- | --- | --- | --- |
| A608-HIGH-001 | High | `lib/post-trade-pure-dormant-git-runner-authority-package-contract-core.ts:491`, `:529`, `:581` | Prerequisite validators recompute fingerprints but do not semantically validate every trust and authority field from resolution, revalidation, and compatibility evidence. | A caller can provide accepted-looking prerequisite evidence with unchecked contradictory fields and a recomputed fingerprint. Examples include compatibility fields such as `laterActivationEligibility`, `mutationAuthorityGranted`, `observerAuthorityGranted`, `stagingAuthorityGranted`, `deploymentAuthorityGranted`, `credentialsUsed`, `observedLiveProcess`, `authoritativeLive`, or contract/policy identity fields, and revalidation fields such as `adapterIdentityFingerprint`, `policyFingerprint`, `authorizationConsumptionAuthority`, `apiAuthority`, `uiAuthority`, `tradingAuthority`, `avanzaAuthority`, `persistenceAuthority`, and `deploymentAuthority`. The package builder can then issue a dormant authority package from semantically contradictory prerequisite evidence. | Revalidate every trust-bearing prerequisite field before issuance, including exact identity, policy, source, runtime, authority, and live-claim fields. Add recomputed-fingerprint forgery tests for each prerequisite class. Fingerprint correctness must remain necessary but insufficient. | Blocks approval. |
| A608-MED-001 | Medium | `lib/post-trade-pure-read-only-git-observation-completion-contract-core.ts:637`, used by Action 607 validators at `lib/post-trade-pure-dormant-git-runner-authority-package-contract-core.ts:462`, `:491`, `:529`, `:581`, `:620` | Exact schema closure is incomplete because `hasExactKeys` uses `Object.keys`, which ignores non-enumerable own string properties, and Action 607 does not apply exact-array closure to nested arrays. | A plain input or prerequisite object can carry non-enumerable own metadata while still passing exact-key checks. Nested arrays such as blocking/reason arrays can carry extra properties that are ignored by `stableNormalize` / canonicalization and are not rejected by Action 607. | Add Action-607-local exact object and exact array validation or use an already reviewed exact helper that checks `Reflect.ownKeys`, descriptors, no non-enumerable extras, no symbols, no accessors, no inherited enumerable properties, exact array prototypes, exact indexes, no holes, and no extra array properties. Add focused schema-attack tests. | Blocks approval. |
| A608-MED-002 | Medium | `lib/post-trade-pure-dormant-git-runner-authority-package-contract-core.ts:49`, `:663`, `:786` | Source-controlled policy values are not fully fingerprint-bound in the issued package/result. | The package/result fingerprints bind selected policy identities and derived fields, but do not bind the complete policy object or a policy fingerprint. Changes to source-controlled policy fields such as `maximumProcessAttempts`, `oneProcessAtATime`, `cacheSubstitutionAllowed`, `runtimeActivation`, `mutationAuthority`, `networkAuthority`, `credentialAuthority`, `arbitraryFilesystemAuthority`, or `writeCommandAuthority` can be invisible if the emitted package shape is unchanged. Future consumers cannot prove which complete source-controlled policy version produced a package. | Include a deterministic policy fingerprint or complete policy snapshot in package and result fingerprint inputs. Add mutation tests proving every trust-critical policy field changes the package/result fingerprint or fails closed. | Blocks approval. |

## Pure Boundary Verdict

Pass with findings unrelated to runtime side effects.

The production core imports `node:crypto` only for deterministic SHA-256 style fingerprints and imports pure contract helpers. Static scans found no `server-only`, filesystem, `child_process`, process environment, network, credential, timer, observer, storage, API, UI, runner, Supabase, Avanza, trading, persistence, migration, staging, or deployment primitive.

The module cannot execute Git, create or observe a process, inspect a repository, consume authority, prevent replay through storage, activate a runner, or grant runtime/staging/deployment authority by itself.

## Identity And Policy Verdict

Partially blocked.

The contract and policy identities are source-controlled and immutable in the module. Unsupported top-level input identities fail closed. However, complete prerequisite identity/policy fields are not all semantically revalidated, and the complete Action 607 policy is not itself fingerprint-bound in the final package/result.

## Input Schema Verdict

Blocked.

Top-level enumerable-field closure, symbol rejection, accessor rejection, class-instance rejection, and exotic-prototype rejection are present. Non-enumerable own string properties and nested array-property attacks remain insufficiently closed.

## Timestamp And Expiry Verdict

Pass.

The contract accepts exact UTC millisecond timestamps and requires `expiresAt - issuedAt = 30000` ms. It rejects 29999 ms, 30001 ms, offsets, missing milliseconds, invalid calendar dates, and expiry-before-issuance. It uses no internal clock and does not claim current unexpired live provenance.

## Prerequisite Evidence Verdicts

Resolution evidence: blocked by A608-HIGH-001.

Revalidation evidence: blocked by A608-HIGH-001.

Compatibility evidence: blocked by A608-HIGH-001.

Worktree evidence: mostly pass, with schema-closure concerns from A608-MED-001.

The validators check many important semantic fields and fingerprints, but the review requires complete prerequisite semantic revalidation. The current checks are too partial for a package that will become input to future authority consumption.

## Shared Linkage Verdict

Partial pass.

The contract checks session, executable, resolver-to-revalidation fingerprint linkage, platform, compatibility source policy, and sequence identity. This is not sufficient while prerequisite identity/authority fields can be forged with recomputed fingerprints.

## Fixed Stage Verdict

Pass.

The issued package has exactly six internal, caller-unconfigurable stage grants in the approved order:

1. `rev-parse --show-toplevel`;
2. `rev-parse --show-object-format`;
3. `rev-parse --verify HEAD`;
4. `symbolic-ref --quiet --short HEAD`;
5. `status --porcelain=v1 -z --untracked-files=all --no-renames --ignore-submodules=none`;
6. `rev-parse --verify HEAD`.

No caller stage list, alternate executable, pathspec, shell, retry, fallback, or output-limit override is accepted.

## Output Retention Verdict

Pass.

Text limits are sourced from the simple observation completion policy. The porcelain-status byte limit is sourced from the byte-oriented porcelain completion policy. No caller override exists.

## Authority Sub-Capability Verdict

Partial pass.

The issued package clearly distinguishes narrow dormant package-scoped grants from runtime activation and prohibited authorities. However, issuance from incompletely revalidated prerequisite evidence is blocked by A608-HIGH-001.

## Initial Package State Verdict

Pass.

The builder emits only `packageState:"issued"`, `currentStageIndex:0`, `consumedStageCount:0`, `remainingStageCount:6`, unconsumed grants, `terminal:false`, `activeConsumer:false`, `retryCount:0`, `fallbackAttempted:false`, `replayDetected:false`, `revoked:false`, and `expired:false`.

No consumed, terminal, revoked, expired, or active-consumer state is constructed.

## Result Union And Reason Model Verdict

Pass with test-quality reservations.

The status and reason unions are closed. Rejected results contain no issued package. Positive results are `authority_package_issued` only and do not represent consumption or runtime readiness.

## Fingerprint Verdict

Blocked by A608-MED-002.

Stage, package, and result fingerprints cover many trust-critical emitted fields. The complete source-controlled policy object is not bound.

## Replay And Semantic Limits Verdict

Pass.

Source, tests, and docs state that package creation does not consume authority, fingerprints do not prevent replay, no atomic storage exists, cloned package objects are not live-safe, no concurrent-consumer protection exists, no current unexpired decision exists, no stage may be executed, no repository may be read, no runner is activated, and TOCTOU remains false.

## Determinism And Immutability Verdict

Pass with schema caveat.

The builder uses explicit input timestamps and deterministic fingerprints. Outputs, policy constants, stage grants, and argv arrays are deeply frozen. Input references are reduced into package values rather than retained wholesale. Schema-closure issues remain separately tracked in A608-MED-001.

## Test Quality Verdict

Blocked.

The focused suite has 26 tests and covers core happy paths, basic timestamp rejection, basic schema rejection, selected prerequisite rejections, fixed stage order, deterministic fingerprints, nullability, and no-consumption/no-runtime state.

It does not materially cover:

- recomputed-fingerprint semantic forgeries across all prerequisite evidence types;
- every authority/security field required by the prerequisite contracts;
- non-enumerable extra own properties;
- exact nested-array property attacks;
- complete policy-field fingerprint mutation coverage.

## Export Surface Verdict

Pass.

Exports are limited to immutable identity/policy/fingerprint constants, closed types, and the pure builder. No consumer, replay reset, clock provider, dependency injection hook, runtime adapter, runner, server-only issuer, or process function is exported.

## Runtime Reachability Verdict

Pass.

Static search found references only in the new production core and focused test. No app, API, UI, component, runner, cron, worker, observer, credential, or process caller imports or invokes the package builder.

## Prohibited Operation Verdict

Pass.

Static search found no production use of filesystem, process spawning, `process.env`, network, credentials, timers, storage, Supabase writes, Git execution, repository inspection, Avanza/trading behavior, migrations, staging, or deployment. `node:crypto` is used only for deterministic hashing; `Date.parse` / `new Date` are used only to validate caller-supplied timestamps.

## Migration Baseline Limitation

The file `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` remains absent. Action 607 did not modify migrations, authorization tests, persistence, migration imports, or test discovery. The limitation predates Action 607 and remains unrelated.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- First focused Action 607 suite attempt hit known Playwright sandbox `EPERM` on `test-results/.last-run.json`.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-runner-authority-package-contract.spec.ts --reporter=dot`: minimal filesystem-escalated rerun passed, 26 tests.
- `npx playwright test tests/e2e/post-trade-pure-read-only-git-compatibility-policy-contract.spec.ts --reporter=dot`: passed, 133 tests.
- `npx playwright test tests/e2e/post-trade-pure-git-version-interpretation-contract.spec.ts tests/e2e/post-trade-pure-apple-git-version-interpretation-contract.spec.ts tests/e2e/post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator.spec.ts --reporter=dot`: passed, 146 tests.
- `npx playwright test tests/e2e/post-trade-pure-aggregate-read-only-git-repository-observation-contract.spec.ts tests/e2e/post-trade-pure-read-only-git-porcelain-status-interpretation-contract.spec.ts tests/e2e/post-trade-pure-byte-oriented-porcelain-status-completion-contract.spec.ts tests/e2e/post-trade-pure-read-only-git-simple-observation-contracts.spec.ts --reporter=dot`: passed, 172 tests.
- `npx playwright test tests/e2e/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter.spec.ts tests/e2e/post-trade-pure-raw-process-completion-evidence-contract.spec.ts tests/e2e/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.spec.ts tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts tests/e2e/post-trade-first-live-read-only-staging-preflight-composition-contract.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-process-executor.spec.ts --reporter=dot`: passed, 135 tests.
- `npx playwright test tests/e2e/post-trade-first-live-read-only-preflight-process-executor.spec.ts tests/e2e/post-trade-first-live-read-only-staging-preflight-composition-contract.spec.ts --reporter=dot`: passed, 22 tests.
- `npx playwright test tests/e2e/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter.spec.ts tests/e2e/post-trade-trusted-live-resolver-adapter.spec.ts tests/e2e/post-trade-trusted-live-resolver-adapter-security-review.spec.ts tests/e2e/post-trade-execution-agent-cross-boundary-integration-readiness-review.spec.ts --reporter=dot`: passed, 689 tests.
- `npx playwright test tests/e2e/post-trade-scoped-macos-process-observer.spec.ts tests/e2e/post-trade-scoped-macos-process-observer-security-review.spec.ts tests/e2e/post-trade-credential-source-adapter-boundary.spec.ts tests/e2e/post-trade-credential-source-adapter-boundary-security-review.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-authorization-artifact.spec.ts tests/e2e/post-trade-staging-execution-authorization-artifact.spec.ts tests/e2e/post-trade-durable-one-shot-authorization-consumption-contract.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-credential-provider.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-cli-version-collector.spec.ts tests/e2e/post-trade-read-only-live-staging-migration-preflight-runner.spec.ts tests/e2e/post-trade-live-ephemeral-staging-supabase-credential-provider-design.spec.ts tests/e2e/post-trade-live-read-only-macos-process-driver-design.spec.ts tests/e2e/post-trade-durable-authorization-consumption-persistence-schema-design.spec.ts --reporter=dot`: passed, 1059 tests.
- `./node_modules/.bin/eslint lib/post-trade-pure-dormant-git-runner-authority-package-contract-core.ts tests/e2e/post-trade-pure-dormant-git-runner-authority-package-contract.spec.ts`: passed.
- `git diff --check`: passed.
- quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.
- static pure-import, identity/policy, input-schema, timestamp/expiry, resolution-evidence, revalidation-evidence, compatibility-evidence, worktree-evidence, shared-linkage, fixed-stage, output-retention, sub-capability, package-state, result-union/reason, fingerprint, replay/semantic-limit, schema-closure, determinism/immutability, focused-test-quality, export-surface, runtime-reachability, and prohibited-operation reviews completed.

## Decision

`post_trade_pure_dormant_git_runner_authority_package_contract_static_security_review_blocked_pending_remediation`

## Result Status

`post_trade_pure_dormant_git_runner_authority_package_action_608_review_completed_blocked`

## Recommended Next Action

Action 609 - Remediate Pure Dormant Git Runner Authority Package Review Findings.

Approval does not authorize Git execution, process creation or observation, repository inspection, authority consumption, replay prevention, storage, runner implementation, runtime/API/UI activation, credentials, environment, network, Avanza/trading, persistence, migrations, staging, deployment, commit, push, merge, or deploy.
