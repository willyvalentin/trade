# Action 610 - Pure Dormant Git Runner Authority Package Final Re-Review

## Executive Summary

Action 610 independently re-reviewed the complete uncommitted Action 607-609 pure dormant Git runner authority-package package.

The package remains pure, fixture-only, deterministic, dormant, and runtime-unreachable. No Git command was executed through production behavior. No process was created or observed. No repository was inspected. No authority was consumed. No replay-prevention storage, runner, runtime/API/UI/cron/worker/CLI reachability, credentials, environment inheritance, network, Avanza/trading behavior, persistence, migrations, staging, deployment, commit, push, merge, or deploy was added.

The review is blocked pending remediation. Action 609 materially improved semantic prerequisite validation, descriptor-based schema closure, and policy fingerprint propagation, but three approval-gate issues remain.

## Action 608 Finding Verdicts

| Finding | Original Severity | Final Verdict | Evidence |
| --- | --- | --- | --- |
| `A608-HIGH-001` | High | Partially remediated; regression remains. | Recomputed semantic forgeries for resolver, revalidation, compatibility, and worktree fields now reject. However, the revalidation validator rejects the production handoff provenance required by the direct-spawn boundary and accepts only a synthetic `productionLiveRevalidationProvenance:"none"` shape. See `A610-MED-001`. |
| `A608-MED-001` | Medium | Partially remediated; array closure gap remains. | Object closure now uses `Reflect.ownKeys` and descriptor checks; exact arrays reject extra own keys, symbols, holes, and exotic prototypes. The array helper still does not inspect inherited enumerable properties on `Array.prototype`. See `A610-MED-003`. |
| `A608-MED-002` | Medium | Partially remediated; policy model coverage remains incomplete. | `authorityPolicyFingerprint` is propagated into stage, package, and result fingerprints. Its canonical input does not explicitly bind every required authority-policy category from the final review gate. See `A610-MED-002`. |

## New Findings

| ID | Severity | File / Symbol | Finding | Failure Scenario | Required Remediation | Approval Impact |
| --- | --- | --- | --- | --- | --- | --- |
| `A610-MED-001` | Medium | `lib/post-trade-pure-dormant-git-runner-authority-package-contract-core.ts:558`, `:568`; `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts:177`; `lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter-core.ts:388` | The authority-package revalidation validator is incompatible with the approved production revalidation handoff. It requires `initialCompositionAdapterId:null` and `productionLiveRevalidationProvenance:"none"`, while the server-only production revalidation adapter marks accepted original objects with `productionLiveRevalidationProvenance:"server_only_private_original_object"`, and the direct-spawn boundary requires that value. | A production-valid revalidation result that could feed direct spawn is rejected by the authority package, while the focused suite uses a synthetic fixture with `initialCompositionAdapterId:null` and `productionLiveRevalidationProvenance:"none"`. This blocks the intended future runner-authority chain and leaves the tests proving a narrower synthetic shape than the contract's stated upstream role. | Decide the exact accepted revalidation source posture. If the package is meant to authorize the future direct-spawn runner path, accept only the exact production-marked original-object revalidation result/evidence and validate its composition linkage and fingerprints. Add a regression test using the approved production revalidation handoff shape. | Blocks final approval. |
| `A610-MED-002` | Medium | `lib/post-trade-pure-dormant-git-runner-authority-package-contract-core.ts:950`, `:959` | `authorityPolicyFingerprint` does not explicitly canonicalize every required authority-policy category. The input includes contract identity, the frozen policy object, stage definitions, and referenced output policies, but does not explicitly bind the initial state policy, pre-consumption and per-stage expiry checks, aggregate-construction expiry check, allowed sub-capabilities, denied authority outputs, and replay/terminal package-state policy as one complete authority policy model. | Future edits to policy decisions represented only as emitted package fields could be covered by package/stage/result fingerprints but not by the source-controlled `authorityPolicyFingerprint` that downstream consumers are expected to verify as the complete policy version. That weakens the Action 609 remediation claim that the complete authority policy itself is fingerprint-bound. | Build a complete source-controlled authority-policy fingerprint input that explicitly includes identity, execution, expiry/freshness, allowed grants, denied authorities, stage sequence, retention, initial state, replay/terminal posture, and semantic limitations. Add mutation sensitivity tests for every policy category. | Blocks final approval. |
| `A610-MED-003` | Medium | `lib/post-trade-pure-dormant-git-runner-authority-package-contract-core.ts:988` | The exact-array helper does not reject inherited enumerable properties on `Array.prototype`. | If `Array.prototype` is polluted with an enumerable property, an otherwise canonical array still has an inherited enumerable key while passing `Array.isArray`, exact prototype, own-key, and descriptor checks. The Action 610 gate requires inherited enumerable array properties to fail closed. | Add a `for...in`/own-property guard or equivalent inherited-enumerable check to the exact-array helper, and add array attack tests for inherited enumerable properties. | Blocks final approval. |

No critical or high finding was identified in Action 610. The three medium findings block final approval under the Action 610 approval rule.

## Prerequisite Completeness

Resolution evidence validation is now substantially complete for the current fixture resolver shape: exact evidence identity, `/usr/bin/git`, resolver policy fingerprint, fixture-only non-live posture, no blocking or ambiguity reasons, timestamp grammar, and evidence fingerprint are checked.

Revalidation evidence validation is semantically stricter than before but currently incompatible with the production handoff shape. It checks many authority, runtime, TOCTOU, metadata, and fingerprint fields, but it accepts only synthetic provenance and rejects production private-original-object provenance.

Compatibility validation enforces the final approved `compatible_for_read_only_observation` posture, exact identities, semantic version bounds, Apple build evidence posture, capability-set satisfaction, no general/write compatibility, all authority fields false, and result fingerprint recomputation.

Worktree linkage validation enforces exact pure aggregate worktree linkage, source classification, sequence identity, no repository-read authority, no runtime activation, no TOCTOU claim, and fingerprint recomputation.

## Recomputed-Forgery Verdict

Pass with the revalidation source-eligibility caveat. Tests and source show recomputed contradictory resolver, revalidation, compatibility, and worktree evidence rejects with no issued package. Fingerprint correctness remains necessary but insufficient.

## Exact Object Verdict

Pass. `isExactRecord` rejects null, arrays, non-plain prototypes, symbols, missing or extra own keys, accessors, non-enumerable extras, and inherited enumerable fields before destructuring into trusted use.

## Exact Array Verdict

Blocked by `A610-MED-003`. The helper rejects extra own string properties, non-enumerable own properties, symbols, holes, appended/deleted elements, shadowed own array methods, subclass/exotic prototypes, and exact-value mismatches. It does not reject inherited enumerable keys present on `Array.prototype`.

## Schema Coverage And Attack Verdict

Partial pass. The focused suite covers major object descriptor attacks and representative nested array attacks for resolver blocking/ambiguity arrays, revalidation blocking reasons, and compatibility reasons. It does not include an inherited-enumerable array attack, and it does not test the production-marked revalidation prerequisite path.

## Policy Canonicalization Verdict

Blocked by `A610-MED-002`. `authorityPolicyFingerprint` is deterministic and propagated, but the canonical input should be expanded into an explicit complete policy model rather than relying on a mix of the frozen base policy, emitted package fields, and referenced policies.

## Fingerprint Propagation Verdict

Pass for propagation. `authorityPolicyFingerprint` is included in every stage-grant fingerprint input, the issued package fingerprint input, and the final result fingerprint input. The coverage of that policy fingerprint is the blocked item.

## Package And Result Consistency

Pass. Issued results contain exactly six grants, initial `issued` state, no consumed state, no runtime activation, no replay-prevention claim, fixed 30000 ms duration, and complete package/result fingerprints. Rejected results have `issuedPackage:null`, no package fingerprint, deterministic reasons, `runtimeActivated:false`, `laterActivationEligibility:false`, and `toctouEliminated:false`.

## Contract Version And Scope

Retaining v1 remains acceptable only after remediation because Actions 607-610 are still uncommitted and runtime-unreachable. Action 609 did not change the six commands, 30000 ms duration, compatibility policy, authority architecture, expiry semantics, or runtime reachability.

## Regression Verdict

Functional regression tests pass, including upstream issuance, Apple issuance, fixed expiry rejection, six-stage ordering, no-runtime/no-consumption posture, and prior boundary suites. Contract compatibility is blocked by the new revalidation-source finding, not by a test failure.

## Replay And Authority Limits

Pass. The package does not consume authority, prevent replay, store state, prove current freshness, activate a runner, inspect repositories, execute Git, or eliminate TOCTOU. Those remain future separately reviewed boundaries.

## Test Quality

Partial pass. The focused suite expanded from 26 to 118 tests and materially covers recomputed prerequisite forgeries, object schema closure, representative array attacks, policy fingerprint propagation, deterministic fingerprints, nullability, deep freeze, and no-runtime posture. It misses the production-marked revalidation path and inherited-enumerable array attack required for final approval.

## Pure Boundary, Exports, And Reachability

Pass with one observation. The production core imports `node:crypto` and pure contract modules only. Static scans found no filesystem, child process, process environment, timers, storage/database, network, credentials, Git execution, process creation or observation, repository inspection, authority consumption, runner, or runtime caller.

The export surface remains limited to identity/policy/fingerprint constants, closed types, the pure builder, and one pure policy-fingerprint helper for tests. It exports no mutable policy, exact schema helper, authority validator, consumption helper, clock provider, replay reset, runtime adapter, runner, or server-only issuer.

## Migration Baseline Limitation

The file `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` remains absent. Actions 607-610 did not modify migrations, authorization tests, persistence, migration imports, or test discovery. The limitation predates this package and remains unrelated.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-runner-authority-package-contract.spec.ts --reporter=dot`: first sandbox attempt hit known `EPERM` on `test-results/.last-run.json`; minimal filesystem-escalated rerun passed, 118 tests.
- `npx playwright test tests/e2e/post-trade-pure-read-only-git-compatibility-policy-contract.spec.ts --reporter=dot`: passed, 133 tests.
- `npx playwright test tests/e2e/post-trade-pure-git-version-interpretation-contract.spec.ts tests/e2e/post-trade-pure-apple-git-version-interpretation-contract.spec.ts tests/e2e/post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator.spec.ts --reporter=dot`: passed, 146 tests.
- `npx playwright test tests/e2e/post-trade-pure-aggregate-read-only-git-repository-observation-contract.spec.ts tests/e2e/post-trade-pure-read-only-git-porcelain-status-observation-contract.spec.ts tests/e2e/post-trade-pure-byte-oriented-porcelain-status-completion-contract.spec.ts --reporter=dot`: passed, 93 tests.
- `npx playwright test tests/e2e/post-trade-pure-read-only-git-simple-observation-contracts.spec.ts tests/e2e/post-trade-pure-read-only-git-porcelain-status-interpretation-contract.spec.ts --reporter=dot`: passed, 79 tests.
- `npx playwright test tests/e2e/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter.spec.ts tests/e2e/post-trade-pure-raw-process-completion-evidence-contract.spec.ts tests/e2e/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.spec.ts tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts tests/e2e/post-trade-first-live-read-only-staging-preflight-composition-contract.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-process-executor.spec.ts --reporter=dot`: passed, 135 tests.
- `npx playwright test tests/e2e/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter.spec.ts tests/e2e/post-trade-trusted-live-resolver-adapter.spec.ts tests/e2e/post-trade-trusted-live-resolver-adapter-security-review.spec.ts tests/e2e/post-trade-execution-agent-cross-boundary-integration-readiness-review.spec.ts --reporter=dot`: passed, 689 tests.
- Broad dormant/process/credential/CLI/authorization regression command excluding the known missing-migration static test: passed, 2554 tests.
- `./node_modules/.bin/eslint lib/post-trade-pure-dormant-git-runner-authority-package-contract-core.ts tests/e2e/post-trade-pure-dormant-git-runner-authority-package-contract.spec.ts`: passed.
- `git diff --check`: passed.
- `git diff --quiet -- .env.local`: passed.
- `find docs -type f -size 0`: passed.
- `test ! -e supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`: passed, confirming the known missing migration baseline.

## Decision

`post_trade_pure_dormant_git_runner_authority_package_contract_final_security_review_blocked_pending_remediation`

## Result Status

`post_trade_pure_dormant_git_runner_authority_package_action_610_final_re_review_completed_blocked`

## Recommended Next Action

Action 611 - Remediate Pure Dormant Git Runner Authority Package Final Review Findings.

## Commit And Deploy

No deploy is recommended for Action 610. Do not create a source-control checkpoint commit until the Action 610 findings are remediated, independently re-reviewed, and the complete diff has been manually inspected.
