# Action 620 - Independent Final Re-Review of Pure Dormant Git Authority Consumption Transition Audit Fingerprint Remediation

Decision: `post_trade_pure_dormant_git_authority_consumption_transition_contract_final_security_review_approved`

Result status: `post_trade_pure_dormant_git_authority_consumption_transition_action_620_final_re_review_completed`

Recommended next Action: Action 621 - Plan Migration and Transactional RPC Implementation for Dormant Git Authority Consumption

## Scope

Action 620 independently re-reviewed the complete uncommitted Action 615-619 pure dormant Git authority-consumption transition package. This was review-only. No transition contract behavior, authority-package behavior, tests, SQL, migrations, RPCs, persistence, storage adapters, live atomicity, replay prevention, runner, runtime/API/UI/cron/worker/CLI reachability, Git execution, process creation, process observation, repository inspection, credentials, environment access, network, Avanza/trading, staging, deployment, commit, push, merge, or deploy behavior was added.

## Finding Verdicts

| Finding | Original severity | Final verdict | Evidence |
| --- | --- | --- | --- |
| `A618-MED-001` returned audit event fingerprint was copied from a preliminary seed event | Medium | Remediated | `permitted` now computes `nextStateCoreFingerprint`, builds one final audit event from final event fields, stores `audit.eventFingerprint` in the final next state, and returns both core and final state fingerprints. No `stableEventFingerprint` or `auditSeedState` production path remains. |
| `A616-MED-004` inconsistent audit event and state linkage | Medium | Remediated | Every permitted operation emits exactly one audit event with previous state, next-state core, transition version, sequence, stage/consumer, reason, timestamp, evidence, and security posture linkage. The final state binds the canonical event fingerprint in `lastAuditEventFingerprint`; the result binds the ordered audit event and final state. |
| `A616-MED-001` incomplete authority-package prerequisite validation | Medium | Remains remediated | Authority-package result/package/stage semantic validation still rejects recomputed forgeries and exact policy/expiry/authority/stage contradictions. |
| `A616-MED-002` incomplete `currentState.stages` exact-array closure | Medium | Remains remediated | `validateCurrentState` still applies exact array shape validation and stage-state validation before fingerprint acceptance. |
| `A616-MED-003` incomplete state invariants and stage ordering | Medium | Remains remediated | `validateStageProgression` still enforces issued, active, partially consumed, terminal, failure, ambiguity, expiry, revocation, and aggregate postures. |
| `A616-LOW-001` broad generic test hash export | Low | Remains remediated | The broad generic hash helper remains absent from production exports. |

## New Findings

| ID | Severity | File / symbol | Description | Failure scenario | Required remediation | Approval impact |
| --- | --- | --- | --- | --- | --- | --- |
| `A620-LOW-001` | Low | `tests/e2e/post-trade-pure-dormant-git-authority-consumption-transition-contract.spec.ts`, `expectAuditFingerprintCanonical` | The focused tests recompute audit event fingerprints through the exported narrow production helper rather than a fully test-local hasher. Static review independently inspected the helper and production construction, and no runtime trust gap was found. | A future regression in the helper's domain or canonicalization could be mirrored by both production construction and the focused recomputation assertion. Current source review still proves the final event body is the helper input and the helper hashes the audit-event domain. | In a future test-hardening action, add a test-local audit-event SHA-256 recomputation mirroring the canonical JSON/domain rule, or remove the production test helper once a public result validator exists. | Nonblocking; does not affect Action 620 approval because production output is canonical and no caller-supplied audit result is accepted. |

Findings by severity:

- Critical: 0
- High: 0
- Medium: 0
- Low: 1 nonblocking
- Informational: 0

## Acyclic Fingerprint Graph

The implemented graph is finite and acyclic:

1. previous state already carries `stateFingerprint`;
2. `permitted` constructs semantic next-state core without final `stateFingerprint` and without `lastAuditEventFingerprint`;
3. `stateCoreFingerprint` is computed from that semantic core;
4. the final audit event is constructed with `previousStateFingerprint`, `nextStateCoreFingerprint`, operation, reason, event sequence, transition versions, actor/stage fields, evidence linkage, policy/package linkage, and false authority/runtime posture;
5. `eventFingerprint` is computed from the returned final audit event body excluding only `eventFingerprint`;
6. final next state stores `lastAuditEventFingerprint:eventFingerprint`;
7. final `stateFingerprint` is computed from the complete state including `stateCoreFingerprint` and `lastAuditEventFingerprint`;
8. result fingerprint binds previous state, next-state core, final next state, and returned audit event.

No event depends on the final state fingerprint while that state depends on the event fingerprint. There is no fixed-point loop, iterative hashing, placeholder fingerprint returned, or mutation after freeze.

## Canonical Audit Event

The returned audit-event schema includes identity, policy, event sequence, operation, authority package ID, package fingerprint, authority policy fingerprint, consumption key, previous state fingerprint, next-state core fingerprint, consumer fingerprint, stage index, stage identity, transition versions, expected/resulting versions, status, reason, timestamp, operation evidence fingerprint, `runtimeActivated:false`, `toctouEliminated:false`, `authority:"none"`, `atomicReplayProtectionPresent:false`, `storageCommitted:false`, and SHA-256 event fingerprint metadata.

No returned audit field is labeled `nextStateFingerprint` while carrying a core fingerprint. The event field is explicitly `nextStateCoreFingerprint`.

## Event / State / Result Linkage

For every permitted operation:

- `event.previousStateFingerprint` equals the actual prior state fingerprint or `null` for registration;
- `event.nextStateCoreFingerprint` equals `result.nextStateCoreFingerprint` and `nextState.stateCoreFingerprint`;
- `nextState.lastAuditEventFingerprint` equals `event.eventFingerprint`;
- `nextState.stateFingerprint` equals `result.nextStateFingerprint`;
- `result.auditEvents` contains exactly the canonical event;
- result fingerprint binds the final event and final state.

Rejected transitions return `nextState:null`, `auditEvents:[]`, `nextStateCoreFingerprint:null`, and `nextStateFingerprint:null`.

## Sequence And Version

The contract emits exactly one event per permitted transition. The event sequence is `previousState.nextAuditSequence` or `0` for registration. The returned next state advances `nextAuditSequence` by one. Transition version before/expected version and transition version after/resulting version are bound into the audit event and result.

No operation emits multiple events today, including aggregate finalization. Event ordering is therefore fixed and non-caller-controlled.

## Validator Consistency

There is no public result-accepting validator in the current pure contract. The public transition builder validates caller input and constructs canonical immutable outputs. For downstream use, `validateCurrentState` recomputes both `stateCoreFingerprint` and final `stateFingerprint`, so stale or contradictory returned states fail when supplied to the next transition. Static review confirms generated result fingerprints bind the returned audit event and final state.

Fingerprint correctness remains necessary but insufficient: semantic validation still rejects malformed authority packages, malformed current states, invalid stage progressions, stale transition versions, terminal-state reuse, timestamp violations, and operation-specific linkage failures.

## Test Quality

The focused suite contains 77 tests. Action 619 additions cover every permitted operation, canonical audit fingerprint recomputation, final audit field sensitivity, final-state event linkage, repeated deterministic construction, and absence of the old `stableEventFingerprint` seed path.

The only test-quality limitation is `A620-LOW-001`: audit recomputation uses the exported narrow helper rather than a fully independent test-local hasher. Static review compensates for final approval by inspecting the helper and construction directly.

## Regression Review

Action 619 did not change:

- operation union;
- durable state union;
- state progression;
- authority-package semantic validation;
- 30000 ms expiry posture;
- CAS semantics;
- retry/fallback posture;
- atomicity/replay limitations;
- runtime reachability.

The contract remains v1 because Actions 615-619 are uncommitted, no runtime consumer exists, and the changes complete the intended first schema before checkpointing.

## Pure Boundary, Exports, And Reachability

Static review found no production import or use of database/Supabase/Postgres, `server-only`, filesystem APIs, `child_process`, `process.env`, timers, locks, storage, network, credentials, Git execution, process or repository access, authority consumption, runner, or runtime caller.

Exports remain limited to immutable identities/policies/domains, closed types, the transition builder, consumption-key/current-state/audit fingerprint helpers, fixture package builder, and narrow identity/policy fingerprint helpers. No storage/RPC adapter, runner, caller event builder, caller state builder, mutable policy/schema helper, or generic arbitrary-value hash helper is exported.

## Migration Baseline Limitation

The migration-static check still fails before test discovery because this file is absent:

`supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`

Actions 615-619 did not modify migrations, persistence, storage, or test discovery. This limitation predates and is unrelated.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-authority-consumption-transition-contract.spec.ts --reporter=dot`: first sandbox attempt hit known Playwright `EPERM` on `test-results/.last-run.json`; minimal filesystem-escalated rerun passed, 77 tests.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-runner-authority-package-contract.spec.ts --reporter=dot`: passed, 155 tests.
- Direct-spawn/revalidation/resolver group: passed, 564 tests.
- Compatibility/parser/orchestrator/observation group: passed, 451 tests.
- Neutralization/raw/composition/process group: passed, 103 tests.
- Action 533 cross-boundary suite: passed, 181 tests.
- Broad dormant/process/credential/CLI/authorization group: passed, 1540 tests.
- Migration-static baseline limitation check: failed before test discovery with known missing migration file; unrelated.
- Scoped ESLint on changed TypeScript files: passed.
- `git diff --check`: passed.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.
- Static audit-fingerprint dependency graph, canonical event fields, event recomputation, state-core/final-state, event/state/result linkage, sequence/version, multi-event, prior-finding regression, result consistency, timestamp, fingerprint, determinism/immutability, atomicity/replay-limit, contract-version, export-surface, runtime-reachability, and prohibited-operation reviews: passed with the nonblocking test-quality limitation above.

## Non-Authorizations

Final approval does not authorize database operations, migrations or RPCs, live atomicity, replay prevention, authority consumption, Git execution, process or repository access, runner/runtime/API/UI activation, credentials, environment access, network, Avanza/trading, persistence, staging, or deployment.

## Commit And Deploy

No deploy is recommended for Action 620.

A source-control checkpoint commit may be considered only after the complete diff has been manually inspected.
