# Action 619 - Pure Dormant Git Authority Consumption Transition Audit Fingerprint Remediation

Decision: `post_trade_pure_dormant_git_authority_consumption_transition_audit_fingerprint_finding_remediated_ready_for_re_review`

Result status: `post_trade_pure_dormant_git_authority_consumption_transition_action_619_remediation_completed`

Recommended next Action: Action 620 - Independent Final Re-Review of Pure Dormant Git Authority Consumption Transition Audit Fingerprint Remediation

## Scope

Action 619 remediated only `A618-MED-001` against the uncommitted Action 615-618 pure dormant Git authority-consumption transition package.

No SQL, migration, RPC, persistence, storage adapter, live atomicity, replay prevention, runner, runtime/API/UI/cron/worker/CLI reachability, Git execution, process creation, process observation, repository inspection, credentials, environment access, network, Avanza/trading, staging, deployment, commit, push, merge, or deploy behavior was added.

## Finding To Remediation Matrix

| Finding | Severity | Action 618 issue | Action 619 remediation | Verdict |
| --- | --- | --- | --- | --- |
| `A618-MED-001` | Medium | Returned audit events reused a seed `eventFingerprint` that was not canonical over the emitted final audit fields. | Replaced the seed-event graph with an acyclic state-core, canonical audit-event, final-state, final-result fingerprint graph. Added tests that recompute every emitted permitted audit event fingerprint from returned fields. | Remediated, pending independent Action 620 re-review |

## Previous Graph

The previous permitted-transition construction used this graph:

1. build an audit seed against an intermediate next state;
2. store the seed event fingerprint in the final next state;
3. return a final audit event that described the final next state;
4. keep the seed event fingerprint on that returned final event.

That avoided a direct cycle but made the returned audit event fingerprint non-canonical over the returned audit event fields.

## Circularity Analysis

A final state fingerprint must bind `lastAuditEventFingerprint`.

An audit event fingerprint cannot also bind the final state fingerprint without creating this cycle:

`audit.eventFingerprint -> audit.nextStateFingerprint -> state.lastAuditEventFingerprint -> audit.eventFingerprint`

The remediation therefore must not claim that a single audit event fingerprint binds the final state fingerprint directly.

## Selected Acyclic Graph

Action 619 uses the following graph:

1. semantic next-state fields produce `stateCoreFingerprint`;
2. the audit event binds `nextStateCoreFingerprint`, previous-state fingerprint, operation, reason, event sequence, transition versions, policy/package linkage, evidence linkage, and explicit authority/runtime false posture;
3. the canonical returned audit event produces `eventFingerprint`;
4. the final next state stores `lastAuditEventFingerprint:eventFingerprint` and produces `stateFingerprint`;
5. the transition result binds both `nextStateCoreFingerprint` and final `nextStateFingerprint`.

The audit event now binds the exact semantic next-state core while the final state binds the canonical audit event. The result binds both ends of the graph.

## Audit Event Schema

Every permitted audit event now explicitly carries:

- `eventKind`;
- `eventVersion`;
- `eventPolicyId`;
- `eventPolicyVersion`;
- `operation`;
- `stageIndex`;
- `stageIdentity`;
- `authorityPackageId`;
- `authorityPackageFingerprint`;
- `authorityPolicyFingerprint`;
- `consumptionKey`;
- `previousStateFingerprint`;
- `nextStateCoreFingerprint`;
- `consumerFingerprint`;
- `expectedTransitionVersion`;
- `resultingTransitionVersion`;
- `eventSequence`;
- `observedAt`;
- `reason`;
- `evidenceFingerprint`;
- `runtimeActivated:false`;
- `toctouEliminated:false`;
- `authority:"none"`;
- `atomicReplayProtectionPresent:false`;
- `storageCommitted:false`;
- `eventFingerprintAlgorithm:"sha256"`;
- `eventFingerprint`.

Rejected transitions still return no accepted audit events and no next state.

## State Fingerprint Model

`stateCoreFingerprint` is computed before `lastAuditEventFingerprint` is attached.

The final state fingerprint is computed after `lastAuditEventFingerprint` is set to the canonical audit event fingerprint. Current-state validation recomputes both fingerprints and rejects stale or contradictory state objects.

## Result Fingerprint Model

Permitted results carry both:

- `nextStateCoreFingerprint`;
- `nextStateFingerprint`.

The final result fingerprint binds the returned next state, the returned audit event, status/reason, operation, previous state fingerprint, expected/resulting transition versions, `runtimeActivated:false`, `toctouEliminated:false`, and `authority:"none"`.

## Tests Added

Focused transition tests increased from 73 to 77.

Action 619 added coverage that:

- recomputes canonical audit event fingerprints for every permitted operation;
- proves mutation of any final audit field changes the audit fingerprint input;
- proves the final state fingerprint binds the canonical event fingerprint through `lastAuditEventFingerprint`;
- proves repeated canonical construction remains finite and deterministic;
- asserts the old `stableEventFingerprint` seed path is absent from production code.

## Reconfirmed Prior Findings

- `A616-MED-001`: remains remediated; authority-package prerequisite validation is complete.
- `A616-MED-002`: remains remediated; stage-array exact schema closure remains active.
- `A616-MED-003`: remains remediated; state-machine and transition ordering invariants remain active.
- `A616-MED-004`: now remediated with exact acyclic audit/state/result linkage.
- `A616-LOW-001`: remains remediated; the broad generic test hash export remains absent.

## Production Changes

Production changes were limited to:

- adding `stateCoreFingerprint` to current state;
- replacing audit `nextStateFingerprint` with `nextStateCoreFingerprint`;
- adding explicit audit event policy/package/linkage/authority posture fields;
- computing audit event fingerprints from final emitted audit event fields;
- binding the final state to the canonical audit event fingerprint;
- binding transition results to both core and final next-state fingerprints;
- recomputing state core and final state fingerprints during current-state validation;
- exposing narrow fingerprint helpers already needed by focused contract tests.

No runtime behavior was introduced.

## Validation Summary

- `./node_modules/.bin/tsc --noEmit`: passed after the known `tsconfig.tsbuildinfo` sandbox write issue was rerun with minimal filesystem escalation.
- Focused transition suite: initial sandbox run hit the known Playwright `.last-run.json` `EPERM`; minimal filesystem-escalated rerun passed, 77 tests.
- Authority-package suite: passed, 155 tests.
- Direct-spawn/revalidation/resolver group: passed, 564 tests.
- Compatibility/parser/orchestrator/observation group: passed, 451 tests.
- Neutralization/raw/composition/process group: passed, 103 tests.
- Action 533 cross-boundary suite: passed, 181 tests.
- Broad dormant/process/credential/CLI/authorization group: passed, 1540 tests.
- Migration-static baseline limitation check: unchanged import-time `ENOENT` for missing `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`; unrelated to Action 619.
- Scoped ESLint on changed TypeScript files: passed.
- `git diff --check`: passed.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.
- Static export-surface, runtime-reachability, prohibited-operation, audit-canonicality, result-fingerprint, state-fingerprint, state-machine, authority/replay-limit, determinism, and immutability reviews: passed.

## Remaining Limitations

The contract remains pure and does not provide:

- database atomicity;
- compare-and-set persistence;
- atomic replay prevention;
- durable locking;
- durable audit storage;
- process authority consumption;
- Git execution;
- repository inspection;
- runtime activation.

Those remain future separately reviewed actions.

## Commit And Deploy

No deploy is recommended for Action 619.

A source-control checkpoint commit may be considered only after Action 620 independently re-reviews the complete Action 615-619 package and the diff is manually inspected.
