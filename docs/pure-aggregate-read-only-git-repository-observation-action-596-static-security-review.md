# Action 596 - Static Security Review of Pure Aggregate Read-Only Git Repository Observation

## Scope

Action 596 independently reviewed the uncommitted Action 595 pure aggregate read-only Git repository observation package. This was static/security and contract review only. No aggregate behavior, individual Git observation contract, parser, orchestrator, neutralizer, direct-spawn, resolver, composition, revalidation, runtime/API/UI/runner path, credential path, migration, persistence, deployment, or test behavior was modified.

Reviewed primary files:

- `lib/post-trade-pure-aggregate-read-only-git-repository-observation-contract-core.ts`;
- `tests/e2e/post-trade-pure-aggregate-read-only-git-repository-observation-contract.spec.ts`;
- `docs/pure-aggregate-read-only-git-repository-observation-contract-action-595.md`;
- `docs/pure-aggregate-read-only-git-repository-observation-action-595-checkpoint.md`;
- Action 594 planning documents and the relevant pure Git observation, byte-completion, parser, dormant orchestration, neutralization, direct-spawn, revalidation, resolver, capability, fingerprint, authority, and Action 533 contracts.

## Executive Verdict

The Action 595 aggregate remains pure, fixture-only, deterministic, runtime-unreachable, non-authoritative, and broadly well-structured. However, the review found one blocking medium-severity contract gap in per-stage security revalidation: accepted repository-root stage evidence can carry forged authority flags that are fingerprint-recomputed and still pass aggregate validation.

Because Action 596 requires full per-stage authority posture revalidation before approval, the review is blocked pending a narrow remediation.

## Findings

| ID | Severity | File | Finding | Evidence | Required remediation | Approval impact |
| --- | --- | --- | --- | --- | --- | --- |
| A596-MED-001 | Medium | `lib/post-trade-pure-aggregate-read-only-git-repository-observation-contract-core.ts:701` | Repository-root stage revalidation does not check every authority/security flag present on root evidence. A forged accepted root result with a recomputed evidence/result fingerprint can set `processAuthorityGranted`, `observerAuthorityGranted`, `cliExecutionAuthorityGranted`, `compatibilityAuthorityGranted`, `runtimeAuthorityGranted`, `stagingAuthorityGranted`, `deploymentAuthorityGranted`, `credentialAuthorityGranted`, `networkAuthorityGranted`, `mutationAuthorityGranted`, or `authorizationConsumed` to a contradictory value and still pass the aggregate's root validator. | Root evidence defines these fields as false in the root contract, but aggregate validation checks only `observedLiveProcess`, `repositoryReadAuthorityGranted`, `runtimeActivated`, `toctouEliminated`, and `authority` through `commonSimpleEvidenceValid`. The focused aggregate test only forges `observedLiveProcess`, `repositoryReadAuthorityGranted`, and `toctouEliminated`, so this gap is not covered. | Extend aggregate root-stage validation to require every root evidence authority/security flag to match the reviewed false/none values. Add focused regression coverage for recomputed root-stage forgeries across the missing flags. | Blocks Action 596 approval because the aggregate cannot yet claim complete per-stage authority posture revalidation. |

No critical or high findings were identified. No substantive remediation was applied in this review action.

## Review Verdicts

- Pure boundary: pass. The aggregate core has no `server-only`, filesystem, child process, environment, network, credential, timer, signal, process-handle, persistence, migration, API/UI, runner, or import-time live behavior. `node:crypto` is used only by the imported pure SHA-256 helper.
- Identity/version: pass. Contract, boundary, policy, sequence, status, and reason identities are fixed, source-controlled, and fingerprint-bound.
- Aggregate schema: pass. The top-level input is closed over fixed named stage slots and approved worktree linkage. No raw Git output, raw path, caller status, caller policy, dependency injection, clock, compatibility, or authority fields are accepted.
- Per-stage revalidation: blocked by `A596-MED-001`. Stage schema/fingerprint validation is otherwise exact, but root authority/security posture is not complete.
- Shared linkage: pass. Session, platform, executable, working directory fingerprint, sequence, and stage-specific policy expectations are checked deterministically.
- Fixed sequence: pass. Fixed named slots enforce root, object format, HEAD before, branch, status, and HEAD after; caller ordering is not accepted.
- Root/worktree: pass with the finding above separate from root-stage authority posture. Comparison is fingerprint-only and does not canonicalize, inspect, or expose filesystem paths.
- Object-format/HEAD: pass with informational note. `unsupported_object_format` is defensive/unreachable under the current object-format stage, which only accepts `sha1` and `sha256`; this is not an approval blocker but should stay documented as currently unreachable unless a future stage supports more formats.
- HEAD stability: pass. Changed HEAD returns `head_changed_during_observation`; matching HEAD never claims TOCTOU elimination.
- Branch/detached: pass. Detached HEAD is a valid non-authoritative observational outcome and no allowed-branch policy is invented.
- Status policy: pass. Accepted clean and dirty status evidence is handled; unsupported ignored/submodule records are rejected by the porcelain-status parser because that stage does not currently emit nonzero ignored or submodule counts.
- Result union: pass. The union is closed and no result is named ready, authorized, approved, eligible, compatible, staging-ready, or deployment-ready.
- Reason model: pass. Precedence is deterministic; the root authority gap requires remediation so stage-specific security defects cannot be masked.
- Fingerprints: pass. Aggregate fingerprints bind identities, stage fingerprints, worktree linkage, shared fields, state outcomes, authority/runtime/TOCTOU fields, and final result.
- TOCTOU: pass. Every result states `toctouEliminated:false`; no retry, freshness, rerun, or consumption policy was added.
- Authority: blocked by `A596-MED-001` for inbound root-stage validation completeness. Aggregate outputs themselves still grant `authority:"none"` and all runtime/compatibility/repository/deployment authority flags remain false.
- Privacy: pass. Aggregate output does not newly expose repository paths, filenames, porcelain paths, raw output, raw branch names, process errors, stacks, or raw object IDs.
- Schema closure: pass at the aggregate envelope and nested exact-key stage levels, subject to the root authority validation gap.
- Determinism/immutability: pass. No internal time, filesystem normalization, locale dependency, stage sorting, mutable retained references, or unfrozen outputs were found.
- Test quality: blocked. The 27 focused tests are meaningful, but they do not cover the missing root-stage authority/security flag forgeries.
- Export surface: pass. Exports are limited to immutable constants, closed types, the worktree linkage builder, aggregate builder, and fingerprint helpers.
- Runtime reachability: pass. Static search found no app/API/UI/runner/cron/observer/credential/trading/persistence/deployment caller.
- Prohibited operations: pass. Static scan found no operation primitives in the aggregate core; hits were false/non-authoritative field names only.
- Migration baseline limitation: unrelated. `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` remains absent, Action 595 did not modify migrations or related authorization tests, and focused/broad suites passed.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- `npx playwright test tests/e2e/post-trade-pure-aggregate-read-only-git-repository-observation-contract.spec.ts --reporter=dot`: first attempt hit known sandbox `EPERM` on `test-results/.last-run.json`; escalated rerun passed, 27 tests.
- Porcelain-status, byte-completion, simple-observation, Apple Git-version parser, and generic Git-version parser group: passed, 250 tests.
- Git-version orchestrator, neutralization, raw-completion, direct-spawn, revalidation, dormant composition, and pure composition group: passed, 163 tests.
- Resolver/security and Action 533 group: passed, 672 tests.
- Broad dormant/process/credential/CLI/authorization group: passed, 887 tests.
- `./node_modules/.bin/eslint lib/post-trade-pure-aggregate-read-only-git-repository-observation-contract-core.ts tests/e2e/post-trade-pure-aggregate-read-only-git-repository-observation-contract.spec.ts`: passed.
- `git diff --check`: passed before and after review-doc creation.
- quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed before and after review-doc creation.
- static import, identity/version, aggregate schema, per-stage revalidation, shared-linkage, sequence, root/worktree, object-format/HEAD, HEAD-stability, branch/detached, clean/dirty, result-union, reason-precedence, fingerprint, TOCTOU, authority, privacy, schema-closure, determinism/immutability, focused-test-quality, export-surface, reachability, prohibited-operation, and migration-baseline reviews were completed.

## Explicit Non-Authorizations

This review does not authorize Git execution, live repository inspection, process creation, process observation, repository-read authority, compatibility decisions, runner implementation, runtime/API/UI/runner activation, credentials, environment access, network access, Avanza or trading behavior, persistence, migrations, deployment, commit, push, merge, or production readiness.

## Decision

Decision:
`post_trade_pure_aggregate_read_only_git_repository_observation_contract_static_security_review_blocked_pending_remediation`

Result status:
`post_trade_pure_aggregate_read_only_git_repository_observation_action_596_review_completed_blocked`

Recommended next Action:
Action 597 - Remediate Pure Aggregate Read-Only Git Repository Observation Review Findings.
