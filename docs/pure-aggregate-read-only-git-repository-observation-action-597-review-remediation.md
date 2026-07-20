# Action 597 - Aggregate Git Observation Root Security Remediation

## Scope

Action 597 remediated only `A596-MED-001` against the uncommitted Action 595-596 package. No aggregate redesign, stage-contract behavior change, Git runner, live capture, runtime/API/UI/runner wiring, Git execution, repository inspection, credential/environment/network access, Avanza/trading behavior, persistence, migration, deployment, commit, push, merge, or deploy was added.

## Finding

`A596-MED-001` found that aggregate repository-root stage revalidation did not enforce every authority/security field carried by accepted root evidence. A forged accepted root result with recomputed root evidence/result fingerprints could carry contradictory authority claims and still pass aggregate root validation.

## Finding-To-Remediation Matrix

| Finding | Previous behavior | Remediation | Verification |
| --- | --- | --- | --- |
| `A596-MED-001` | `validateRootResult` checked exact root schema and fingerprints, but only a subset of root authority/security fields through `commonSimpleEvidenceValid`. | Added private root-specific `rootSecurityPostureValid` and required it during root-stage validation. It enforces every authority/security field present in the approved root evidence schema. | Expanded focused aggregate suite from 27 to 48 tests, including recomputed-fingerprint root forgeries for every root authority/security field and schema-extension rejection for unsupported security fields. |

## Corrected Root Security Posture

Root evidence is now rejected unless all root-schema authority/security fields exactly match:

- `observedLiveProcess:false`;
- `repositoryReadAuthorityGranted:false`;
- `processAuthorityGranted:false`;
- `observerAuthorityGranted:false`;
- `cliExecutionAuthorityGranted:false`;
- `compatibilityAuthorityGranted:false`;
- `runtimeAuthorityGranted:false`;
- `stagingAuthorityGranted:false`;
- `deploymentAuthorityGranted:false`;
- `credentialAuthorityGranted:false`;
- `networkAuthorityGranted:false`;
- `mutationAuthorityGranted:false`;
- `authorizationConsumed:false`;
- `runtimeActivated:false`;
- `toctouEliminated:false`;
- `authority:"none"`.

The current approved root evidence schema does not contain `shellUsed`, `pathLookupUsed`, `inheritedEnvironmentUsed`, `credentialsUsed`, or `networkUsed`. Those fields are not defaulted or aliased; attempts to add them are rejected by exact root evidence schema closure.

## Reason And Precedence

Contradictory root security posture remains a root-stage validation failure:

- aggregate status: `input_rejected`;
- aggregate reason: `root_evidence_rejected`.

This preserves the Action 595 precedence model: malformed root evidence fails before shared linkage, repository root/worktree comparison, HEAD stability, detached handling, dirty handling, or clean-stable construction.

## Production Changes

Changed:

- `lib/post-trade-pure-aggregate-read-only-git-repository-observation-contract-core.ts`
  - added private `rootSecurityPostureValid`;
  - invoked it from `validateRootResult`.

Unchanged:

- aggregate identity, policy, input schema, result union, root/worktree comparison, object-format/HEAD linkage, HEAD stability, branch/detached policy, clean/dirty policy, TOCTOU posture, output authority posture, exports, runtime reachability, and all individual stage contracts.

## Tests Added

The focused aggregate suite now includes individually named remediation tests for recomputed root evidence forgeries:

- `processAuthorityGranted:true`;
- `observerAuthorityGranted:true`;
- `cliExecutionAuthorityGranted:true`;
- `credentialAuthorityGranted:true`;
- `networkAuthorityGranted:true`;
- `mutationAuthorityGranted:true`;
- `repositoryReadAuthorityGranted:true`;
- `compatibilityAuthorityGranted:true`;
- `runtimeAuthorityGranted:true`;
- `stagingAuthorityGranted:true`;
- `deploymentAuthorityGranted:true`;
- `authorizationConsumed:true`;
- `observedLiveProcess:true`;
- `runtimeActivated:true`;
- `toctouEliminated:true`;
- `authority` other than `"none"`.

The suite also covers root schema extension attempts for unsupported security fields:

- `credentialsUsed:true`;
- `networkUsed:true`;
- `shellUsed:true`;
- `pathLookupUsed:true`;
- `inheritedEnvironmentUsed:true`.

Focused test count before Action 597: 27.

Focused test count after Action 597: 48.

## Fingerprint-Forgery Verdict

Recomputed root evidence/result fingerprints no longer bypass semantic security validation. Fingerprint correctness remains necessary but insufficient.

## Regression Verdict

Action 597 did not alter object-format validation, HEAD-before/after validation, branch validation, porcelain-status validation, shared linkage, root/worktree comparison, result precedence after root acceptance, path privacy, TOCTOU posture, authority posture, export surface, or runtime reachability.

## Remaining Limitations

This remediation does not approve the aggregate as finally reviewed. A separate independent final re-review is still required. The aggregate remains pure fixture-only evidence infrastructure and does not authorize Git execution, live repository inspection, compatibility evaluation, runtime activation, staging, deployment, or production use.

The unrelated migration-suite baseline limitation remains: `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` is absent and was not modified by Action 597.

## Validation

- initial `./node_modules/.bin/tsc --noEmit`: sandbox `EPERM` on `tsconfig.tsbuildinfo`;
- rerun `./node_modules/.bin/tsc --noEmit` with local build-info write permission: passed;
- `./node_modules/.bin/eslint lib/post-trade-pure-aggregate-read-only-git-repository-observation-contract-core.ts tests/e2e/post-trade-pure-aggregate-read-only-git-repository-observation-contract.spec.ts`: passed;
- expanded focused aggregate suite: first sandbox attempt hit known Playwright `EPERM` on `test-results/.last-run.json`; escalated rerun passed, 48 tests;
- porcelain-status, byte-completion, simple-observation, Apple Git-version parser, and generic Git-version parser group: 250 passed;
- Git-version orchestrator, neutralization, raw-completion, direct-spawn, revalidation, dormant composition, and pure composition group: 163 passed;
- resolver/security and Action 533 group: 672 passed;
- broad dormant/process/credential/CLI/authorization group: 887 passed;
- static root-schema review: passed;
- static complete root-security-posture review: passed;
- static semantic-forgery review: passed;
- static root reason-precedence review: passed;
- static aggregate result-union regression review: passed;
- static fingerprint regression review: passed;
- static TOCTOU review: passed;
- static authority/no-runtime review: passed;
- static path-privacy review: passed;
- static export-surface review: passed;
- static runtime-reachability review: passed;
- static prohibited-operation review: passed;
- migration-suite baseline limitation check: unrelated;
- quiet `.env.local` diff guard: passed;
- `find docs -type f -size 0`: passed before and after Action 597 docs were created.

## Re-Review Recommendation

Action 598 should independently re-review the root security remediation and decide whether the Action 595 aggregate package can be approved after remediation.

## Decision

Decision:
`post_trade_pure_aggregate_read_only_git_repository_observation_action_596_finding_remediated_ready_for_re_review`

Result status:
`post_trade_pure_aggregate_read_only_git_repository_observation_action_597_remediation_completed`

Recommended next Action:
Action 598 - Independent Final Re-Review of Pure Aggregate Read-Only Git Repository Observation Root Security Remediation.

## Commit And Deploy

No commit, push, merge, or deploy occurred. No deploy is recommended for Action 597.
