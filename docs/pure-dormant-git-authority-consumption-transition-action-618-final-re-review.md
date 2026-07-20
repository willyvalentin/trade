# Action 618 - Independent Final Re-Review of Pure Dormant Git Authority Consumption Transition Remediation

Decision: `post_trade_pure_dormant_git_authority_consumption_transition_contract_final_security_review_blocked_pending_remediation`

Result status: `post_trade_pure_dormant_git_authority_consumption_transition_action_618_final_re_review_completed_blocked`

Recommended next Action: Action 619 - Remediate Pure Dormant Git Authority Consumption Transition Audit Fingerprint Canonicality

## Scope

Action 618 independently re-reviewed the complete uncommitted Action 615-617 pure dormant Git authority-consumption transition package. The review inspected the transition core, focused tests, Action 615 implementation documentation, Action 616 static review, Action 617 remediation, the final-approved dormant Git runner authority-package contract, and adjacent resolver, revalidation, direct-spawn, compatibility, aggregate, completion, lifecycle, provenance, and Action 533 contracts.

This was review-only. No transition contract behavior, tests, SQL, migrations, RPC, persistence, storage adapter, live atomicity, replay prevention, runner, runtime/API/UI/cron/worker/CLI reachability, Git execution, process creation, process observation, repository inspection, credentials, environment, network, Avanza/trading, staging, deployment, commit, push, merge, or deploy behavior was added.

## Action 616 Finding Verdicts

| Finding | Original severity | Final verdict | Evidence |
| --- | --- | --- | --- |
| `A616-MED-001` incomplete semantic authority-package prerequisite validation | Medium | Remediated | `validateAuthorityPackageResult`, `validatePackage`, and `validateStageGrant` now verify identity, policy, result/package linkage, exact 30000 ms expiry, allowed and denied authority posture, initial package state, exact six grants, grant argv/limits, stage fingerprints, package fingerprint, and result fingerprint. Recomputed semantic package forgeries reject before registration. |
| `A616-MED-002` incomplete exact-array closure for `currentState.stages` | Medium | Remediated | `validateCurrentState` applies exact stage-array shape validation. The helper rejects exotic prototypes, inherited enumerable properties, symbols, accessors, holes, extra own keys, shadowed built-ins, appended/deleted elements, and noncanonical numeric keys. |
| `A616-MED-003` incomplete state-machine invariants and transition ordering | Medium | Remediated | `validateStageProgression` enforces contiguous accepted prefixes, at most one consumed pending stage, no later progress after failure or ambiguity, exact state-specific active/terminal postures, and completion requires `stageIndex === currentStageIndex`. |
| `A616-MED-004` inconsistent audit event and state linkage | Medium | Partially remediated; new blocking finding remains | Returned `nextState.lastAuditEventFingerprint` now equals the returned audit event fingerprint, and stage audit indexes identify the operation stage. However, the returned audit event fingerprint is reused from a seed audit computed before the final `nextStateFingerprint`, so it is not a digest of the audit event as emitted. |
| `A616-LOW-001` broad generic test hash export | Low | Remediated | `sha256ForDormantGitAuthorityTransitionTest` is no longer exported. The production export surface is limited to immutable constants/types, the transition builder, consumption-key/current-state fingerprint helpers, fixture package builder, and narrow identity/policy fingerprint helpers. |

## New Findings

| ID | Severity | File / symbol | Description | Failure scenario | Required remediation | Approval impact |
| --- | --- | --- | --- | --- | --- | --- |
| `A618-MED-001` | Medium | `lib/post-trade-pure-dormant-git-authority-consumption-transition-contract-core.ts`, `permitted`, `buildAuditEvent` | The returned audit event's `eventFingerprint` is not canonical over the returned audit event fields. `permitted` first builds an audit seed against `auditSeedState`, stores that seed fingerprint in the final state, then returns a final audit event with the final state's `nextStateFingerprint` but the seed event fingerprint. | A future storage/RPC implementation or auditor that verifies an audit row by recomputing `eventFingerprint` over the emitted audit fields will reject canonical transition output or, worse, treat the event fingerprint as binding a different `nextStateFingerprint` than the row actually carries. The result fingerprint still binds the returned audit object, but the audit event's own fingerprint is not self-verifying. | Define a non-circular audit/state fingerprint model. One narrow path is to keep `nextState.lastAuditEventFingerprint` outside the state fingerprint input or to use an explicit audit-link field that does not require reusing a pre-finalization event fingerprint. Add regression coverage that recomputes the emitted audit event fingerprint from the returned audit event fields and verifies equality for every permitted transition. | Blocks final approval because Action 618 requires audit events to exactly match next state and complete timestamp/fingerprint linkage. |

Findings by severity:

- Critical: 0
- High: 0
- Medium: 1
- Low: 0
- Informational: 0

## Authority-Package Revalidation

The re-review confirmed the Action 617 authority-package prerequisite validation is materially complete for the final-approved Action 607-612 package. The transition contract rejects malformed, stale-fingerprint, and recomputed semantic forgeries covering:

- altered authority policy fingerprint;
- altered package identity or prerequisite linkage;
- altered expiry delta and freshness posture;
- altered six-stage order, argv, output limits, grants, and stage fingerprints;
- consumed initial grants;
- altered initial current stage/counts/terminal state;
- runtime, mutation, credential, network, staging, deployment, later-activation, TOCTOU, replay, or storage claims.

Verdict: pass.

## Exact Arrays

The current-state `stages` array is closed with an exact array shape check requiring an actual `Array`, prototype exactly `Array.prototype`, exact own keys for indexes `0` through `5` and `length`, no holes, no symbols, no accessors, no extra own string keys, no inherited enumerable properties anywhere in the prototype chain, no subclass/exotic prototype, no shadowed built-ins, and no noncanonical numeric-looking keys.

Authority-package stage grants and nested argv arrays are also exact-validated through package/stage-grant semantic validation.

Verdict: pass.

## State Machine and Progression

The state model now enforces:

- `issued`: no consumer, no stage progress, current stage `0`, non-terminal;
- `active`: consumer claimed, no stage progress, current stage `0`, non-terminal;
- `partially_consumed`: contiguous accepted prefix and optional one pending consumed stage;
- ready-for-aggregate posture: all six accepted completions, current stage `6`, active consumer, aggregate null, non-terminal;
- `consumed`: all six accepted completions, aggregate fingerprint present, no active consumer, terminal `sequence_consumed`;
- `failed_consumed`: exact failed or rejected stage outcome and no later-stage progress;
- `ambiguous_failed_consumed`: exact ambiguous stage outcome and no later-stage progress;
- `expired` / `revoked`: exact terminal flags and reasons, no active consumer, no aggregate.

Stage completion is constrained to the current consumed stage, rejected/process/ambiguous outcomes cannot carry interpretation fingerprints, accepted outcomes must carry interpretation fingerprints, and detached accepted completion is allowed only for stage `3`.

Verdict: pass.

## Audit and State Linkage

The returned state and returned audit event now agree on:

- previous state fingerprint;
- returned next state fingerprint;
- transition version before and after;
- event sequence;
- operation identity;
- consumer fingerprint;
- operation stage index and identity;
- reason;
- observed timestamp;
- operation evidence fingerprint;
- `nextState.lastAuditEventFingerprint`.

However, `eventFingerprint` is assigned from the seed audit event, not recomputed over the returned final audit event. The final audit event carries the final state fingerprint in `nextStateFingerprint`, while the fingerprint field was calculated before that final state fingerprint existed.

Verdict: blocked by `A618-MED-001`.

## Operation Regression

No operation list change was found. The closed operations remain:

- `register_package`;
- `claim_consumer`;
- `consume_stage`;
- `record_stage_completion`;
- `terminalize_failure`;
- `terminalize_ambiguous_failure`;
- `terminalize_expiry`;
- `revoke_package`;
- `finalize_aggregate`.

No operation was made caller-configurable. Rejected transitions still return `nextState:null` and no audit events.

Verdict: pass.

## CAS and Precedence

The review confirmed non-registration transitions validate current state schema and semantic invariants before accepting `currentStateFingerprint`, enforce exact expected transition version, reject terminal/revoked/expired states before operation-specific mutation, and preserve operation-specific stage, consumer, timestamp, and evidence predicates.

Verdict: pass, with audit-fingerprint remediation still required before final approval.

## Timestamp Model

All timestamps use canonical UTC millisecond grammar. The contract uses caller-provided `observedAt` as pure transition evidence only; it has no internal clock. Registration, claim, stage consumption, completion, aggregate finalization, expiry, and revocation retain deterministic temporal checks. Expiry transition is allowed only at or after `expiresAt`.

Verdict: pass.

## Fingerprints

State and result fingerprints bind transition-relevant fields, including identities, policy, package, consumption key, state, expected/resulting versions, consumer, stage, timestamps, evidence fingerprints, next state, audit events, runtime flags, TOCTOU posture, authority posture, status, and reason.

Audit event fingerprint coverage remains incomplete because the event fingerprint is not computed from the emitted event fields. Fingerprints do not claim atomicity or replay prevention.

Verdict: blocked by `A618-MED-001`.

## Test Quality

The focused suite contains 73 tests. Action 617 additions materially cover:

- recomputed authority-package semantic forgeries;
- exact current-state stage-array attacks;
- state-specific invariant contradictions;
- six-stage consumed/pending/completed progression;
- detached stage `3`;
- failure and ambiguity;
- ready-for-aggregate and finalization;
- audit next-state and last-event linkage;
- stage audit indexes;
- rejected audit nullability;
- export removal;
- deterministic fingerprints;
- deep freeze;
- explicit atomicity/replay limitations.

Coverage gap: no test recomputes the returned audit event fingerprint from the returned audit event fields. Such a test would currently expose `A618-MED-001`.

Verdict: blocked by one focused audit-fingerprint gap.

## Contract Version and Scope

Retaining v1 remains generally justified because Actions 615-617 are uncommitted and no runtime consumer exists. The remediation needed for `A618-MED-001` can remain in v1 if completed before the package is committed.

Action 617 did not change operation list, durable states, 30-second expiry, authority-package behavior, no-retry/fallback policy, pure/storage-free boundary, or runtime reachability.

Verdict: pass, conditional on audit-fingerprint remediation before final approval.

## Pure Boundary, Exports, and Reachability

Static review found no production imports of:

- database/Supabase/Postgres;
- `server-only`;
- filesystem APIs;
- `child_process`;
- `process.env`;
- timers or locks;
- network or credentials;
- Git execution;
- process or repository access;
- authority consumption;
- runner/runtime callers.

The only source reachability for the transition contract is the module itself, its focused test, and documentation/summary references. The focused test imports `node:fs` only to inspect source text.

Verdict: pass.

## Migration Baseline Limitation

The migration-static check still fails before test discovery because this file is absent:

`supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`

Actions 615-617 did not modify migrations, persistence, authorization storage, or test discovery. The limitation predates and is unrelated to this transition contract package.

Verdict: unrelated baseline limitation.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-authority-consumption-transition-contract.spec.ts --reporter=dot`: first sandbox attempt failed on Playwright `EPERM` writing `test-results/.last-run.json`; minimal filesystem-escalated rerun passed, 73 tests.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-runner-authority-package-contract.spec.ts --reporter=dot`: first sandbox attempt failed on Playwright `EPERM` writing `test-results/.last-run.json`; minimal filesystem-escalated rerun passed, 155 tests.
- Direct-spawn/revalidation/resolver group: passed, 564 tests.
- Compatibility/parser/orchestrator/observation group: passed, 451 tests.
- Neutralization/raw/composition/process group: passed, 103 tests.
- Action 533 cross-boundary suite: passed, 181 tests.
- Broad dormant/process/credential/CLI/authorization group: passed, 1540 tests.
- Migration-static baseline limitation check: failed with known missing migration file before test discovery.
- `./node_modules/.bin/eslint lib/post-trade-pure-dormant-git-authority-consumption-transition-contract-core.ts tests/e2e/post-trade-pure-dormant-git-authority-consumption-transition-contract.spec.ts`: passed.
- `git diff --check`: passed.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.
- Static authority-package schema/semantic review: pass.
- Static exact-array/stage-array review: pass.
- Static global/state-specific invariant review: pass.
- Static stage-progression/completion-order review: pass.
- Static audit/state linkage review: blocked by `A618-MED-001`.
- Static audit sequence/version review: pass except audit-fingerprint canonicality.
- Static operation regression review: pass.
- Static CAS/precedence review: pass.
- Static timestamp review: pass.
- Static fingerprint review: blocked by `A618-MED-001`.
- Static determinism/immutability review: pass.
- Static atomicity/replay-limit review: pass.
- Static focused-test-quality review: pass except audit-fingerprint recomputation gap.
- Static export-surface review: pass.
- Static runtime-reachability review: pass.
- Static prohibited-operation review: pass.
- Migration-baseline limitation check: unrelated known limitation.

## Non-Authorizations

This review does not authorize database operations, migrations or RPCs, live atomicity, replay prevention, authority consumption, Git execution, process or repository access, runner/runtime/API/UI activation, credentials, environment or network access, Avanza/trading behavior, persistence, staging, deployment, commit, push, merge, or deploy.

## Final Decision

The Action 617 remediation closes `A616-MED-001`, `A616-MED-002`, `A616-MED-003`, and `A616-LOW-001`. It partially closes `A616-MED-004` by making returned state/audit equality and stage linkage exact, but it leaves a medium audit-fingerprint canonicality defect.

Decision: `post_trade_pure_dormant_git_authority_consumption_transition_contract_final_security_review_blocked_pending_remediation`

Result status: `post_trade_pure_dormant_git_authority_consumption_transition_action_618_final_re_review_completed_blocked`

Recommended next Action: Action 619 - Remediate Pure Dormant Git Authority Consumption Transition Audit Fingerprint Canonicality

No deploy is recommended. No commit is recommended until the blocking audit-fingerprint finding is remediated and re-reviewed.
