# Action 617 - Pure Dormant Git Authority Consumption Transition Review Remediation

Action 617 remediated all Action 616 findings against the uncommitted Action 615-616 pure dormant Git authority-consumption transition package.

The remediation remains pure, fixture-only, deterministic, deeply immutable, storage-free, runtime-unreachable, non-atomic outside future storage, replay-unprotected outside future storage, and bound to the final-approved dormant Git runner authority package.

No database operation occurred. No SQL, migration, RPC, persistence, storage adapter, runner, runtime path, Git execution, process creation or observation, repository inspection, credential access, environment access, network access, Avanza/trading behavior, staging behavior, deployment, commit, push, or merge was added.

## Finding-to-Remediation Matrix

| Action 616 finding | Severity | Remediation | Verdict |
| --- | --- | --- | --- |
| `A616-MED-001` incomplete semantic authority-package prerequisite validation | Medium | Expanded private validation for authority-package result identity, policy, status/reason, result/package linkage, expiry/freshness posture, allowed sub-capabilities, denied authorities, initial package state, exact stage grants, stage argv, limits, and fingerprints. Recomputed semantic forgeries reject with `authority_package_rejected`. | Remediated |
| `A616-MED-002` incomplete exact-array closure for `currentState.stages` | Medium | Added descriptor/prototype-chain exact-array shape validation and applied it to `currentState.stages`; stage-grant `argv` arrays remain exact-value checked. Added stage-array attack coverage. | Remediated |
| `A616-MED-003` incomplete state-machine invariants and transition ordering | Medium | Added a single stage-progression invariant model covering issued, active, pending consumption, accepted prefix, ready-for-aggregate, consumed, failed, ambiguous, expired, and revoked states. Completion now requires `stageIndex === currentStageIndex`. | Remediated |
| `A616-MED-004` inconsistent audit event and state linkage | Medium | Reworked permitted transition audit construction so each permitted result emits one audit event, the event links to returned state semantics, and `nextState.lastAuditEventFingerprint` equals the returned event fingerprint. Stage audit linkage is now explicit. Action 619 subsequently replaced the non-canonical final-next-state audit link with an acyclic `nextStateCoreFingerprint` link. | Remediated after Action 619 |
| `A616-LOW-001` broad generic test hash export | Low | Removed `sha256ForDormantGitAuthorityTransitionTest` from the production core. Tests use a test-local SHA-256 helper only. | Remediated |

## Corrected Authority-Package Validation

The previous validator accepted a fingerprint-correct authority-package result after checking only a subset of fields.

The corrected validator now checks contract identity, policy identity, status, reason, package/result linkage, executable resolution, revalidation, compatibility, worktree, executable, platform, source policy, session, sequence, fixed 30000 ms expiry, no extension/refresh/grace/reissue posture, exact initial package state, allowed package-scoped grants, denied authorities, six exact stage grants, exact argv, exact limits, and stage fingerprints.

Fingerprint correctness remains necessary but insufficient.

## Corrected Array Closure

`currentState.stages` now requires an actual `Array`, prototype exactly `Array.prototype`, no inherited enumerable properties, exact length six, own keys exactly indexes `0` through `5` plus `length`, no holes, no accessors, no symbols, no extra string keys, no exotic prototypes, no subclass arrays, no shadowed methods, no appended/deleted elements, no reordered or duplicate stages, and no noncanonical numeric keys.

## Final State-Progression Model

- `issued`: no consumer, no stage progress, `currentStageIndex:0`.
- `active`: consumer claimed, no stage progress, `currentStageIndex:0`.
- `partially_consumed`: consumer present, accepted completions form a contiguous prefix, and at most one current stage is consumed but pending completion.
- Accepted completion advances `currentStageIndex` by exactly one.
- After accepted stage 5 completion, `currentStageIndex:6` and the state remains non-terminal `partially_consumed` until aggregate finalization.
- `consumed`: all six stages accepted, aggregate fingerprint present, terminal reason `sequence_consumed`.
- `failed_consumed`: exact failed/rejected stage outcome and no later-stage progress.
- `ambiguous_failed_consumed`: exact ambiguous stage outcome and no later-stage progress.
- `expired` and `revoked`: terminal flags and reasons exact with no aggregate fingerprint.

## Corrected Audit/State Linkage

Every permitted transition emits one audit event. As finalized by Action 619, the event binds operation, stage where applicable, consumer where applicable, previous-state fingerprint, returned next-state core fingerprint, transition versions, event sequence, observed timestamp, reason, operation evidence fingerprint, policy/package linkage, and authority/runtime false posture.

The returned next state stores the same canonical final event fingerprint in `lastAuditEventFingerprint`, and `nextAuditSequence` advances by exactly one. The audit event does not carry the final next-state fingerprint because that would create a circular dependency; the final transition result binds both the next-state core fingerprint and the final next-state fingerprint.

## Export Decision

The generic arbitrary-domain hash helper was removed from the production core. Export surface remains limited to immutable identities/policies/domains, closed types, the transition builder, consumption-key helper, current-state fingerprint helper, fixture package builder, and narrow identity/policy fingerprint helpers.

## Contract Version Decision

The contract remains v1 because Actions 615-617 are still uncommitted, no runtime consumer exists, and the changes complete the intended first-version schema before checkpoint approval.

## Tests Added

Focused transition tests increased from 43 to 73.

Added coverage includes recomputed authority-package semantic forgeries, exact stage-array attack matrix, recomputed contradictory state progressions, audit state-core and last-event linkage, stage audit indexes for consumption and completion, and export-surface regression for the removed generic hash helper. Action 619 added further coverage that recomputes emitted audit event fingerprints for every permitted operation.

## Validation

- `./node_modules/.bin/tsc --noEmit`: first non-escalated attempt hit known `tsconfig.tsbuildinfo` `EPERM`; escalated reruns passed.
- Expanded transition suite: passed, 73 tests.
- Authority-package suite: passed, 155 tests.
- Direct-spawn, revalidation, and resolver suites: passed, 564 tests.
- Compatibility, parser, orchestrator, aggregate, porcelain, byte-completion, and simple-observation suites: passed, 451 tests.
- Neutralization, raw-completion, composition, and process-executor suites: passed, 103 tests.
- Action 533 cross-boundary suite: passed, 181 tests.
- Broad credential, CLI, authorization, and persistence-design suites excluding the known missing migration-static file: passed, 555 tests.
- Migration-static baseline check: unchanged import-time `ENOENT` for missing `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`; unrelated to Action 617.
- Scoped ESLint on changed TS files: passed.
- `git diff --check`: passed.
- Static authority-package schema, semantic revalidation, exact-array/stage-array, state-invariant, stage-progression, completion-order, audit/state, audit-sequence/version, result/precedence, fingerprint, determinism/immutability, atomicity/replay-limit, export-surface, runtime-reachability, and prohibited-operation reviews: pass.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.

## Remaining Limitations

The contract still does not provide database atomicity, compare-and-set persistence, replay prevention, durable locking, durable audit storage, process authority consumption, Git execution, repository inspection, or runtime activation. Those remain future separately reviewed actions.

## Decision

`post_trade_pure_dormant_git_authority_consumption_transition_action_616_findings_remediated_ready_for_re_review`

## Result Status

`post_trade_pure_dormant_git_authority_consumption_transition_action_617_remediation_completed`

## Recommended Next Action

Action 618 - Independent Final Re-Review of Pure Dormant Git Authority Consumption Transition Remediation.

No deploy is recommended for Action 617. A source-control checkpoint commit may be considered only after the remediation diff is manually inspected and Action 618 independently re-reviews the package.
