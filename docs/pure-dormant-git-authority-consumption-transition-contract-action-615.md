# Action 615 - Pure Dormant Git Authority Consumption Transition Contract

Decision: `post_trade_pure_dormant_git_authority_consumption_transition_contract_ready_for_static_security_review`

Result status: `post_trade_pure_dormant_git_authority_consumption_transition_action_615_implemented_fixture_only`

## Scope

Action 615 implements the smallest pure, fixture-only, deterministic transition contract for future atomic one-shot consumption of the final-approved dormant Git runner authority package.

The contract models state transitions only. It performs no database operation, creates no SQL or migration, implements no RPC, implements no storage adapter, consumes no authority live, provides no atomic replay prevention without storage, executes no Git command, creates or observes no process, inspects no repository, implements no runner, activates no runtime/API/UI/cron/worker/CLI path, reads no credentials or environment values, opens no network path, and adds no Avanza/trading, persistence, staging, or deployment behavior.

## Files

Created:

- `lib/post-trade-pure-dormant-git-authority-consumption-transition-contract-core.ts`
- `tests/e2e/post-trade-pure-dormant-git-authority-consumption-transition-contract.spec.ts`
- `docs/pure-dormant-git-authority-consumption-transition-contract-action-615.md`
- `docs/pure-dormant-git-authority-consumption-transition-action-615-checkpoint.md`

Updated:

- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Identities

Contract identity:

- contract kind: `pure_dormant_git_authority_consumption_transition_contract`
- contract ID: `ture.execution.pure-dormant-git-authority-consumption-transition-contract.fixture.v1`
- contract version: `1`
- boundary ID: `ture.execution.dormant-git-authority-consumption-transition.fixture-boundary.v1`

Policy identities:

- transition policy: `ture.execution.dormant-git-authority-consumption.transition-policy.v1`
- state policy: `ture.execution.dormant-git-runner-authority-consumption-storage.schema-family.v1`
- replay policy: `ture.execution.dormant-git-authority-consumption.replay-policy.v1`
- concurrency policy: `ture.execution.dormant-git-authority-consumption.concurrency-policy.v1`
- terminal-state policy: `ture.execution.dormant-git-authority-consumption.terminal-state-policy.v1`
- audit-event policy: `ture.execution.dormant-git-authority-consumption.audit-event-policy.v1`
- compare-and-set policy: `ture.execution.dormant-git-authority-consumption.compare-and-set-policy.v1`

All identities are source-controlled and fingerprint-bound. Callers cannot select them.

## State Model

Implemented durable fixture states:

- `issued`;
- `active`;
- `partially_consumed`;
- `consumed`;
- `failed_consumed`;
- `ambiguous_failed_consumed`;
- `expired`;
- `revoked`.

Replay and conflict outcomes are not mutable package states. Terminal states do not transition back to non-terminal states.

## Input Models

The contract accepts exact closed fixture inputs only:

- `register_package`;
- `claim_consumer`;
- `consume_stage`;
- `record_stage_completion`;
- `terminalize_failure`;
- `terminalize_ambiguous_failure`;
- `terminalize_expiry`;
- `revoke_package`;
- `finalize_aggregate`.

There is no generic `update_state` operation. Inputs cannot include caller next state, caller audit event, caller result status, dependency injection, storage handles, clocks, process handles, or raw output.

## Registration

Registration accepts one final-approved `authority_package_issued` fixture result, deterministic consumption key, explicit observation timestamp, and initial transition version `0`.

It returns an `issued` state with six unconsumed stage records, transition version `1`, initial audit evidence, and deterministic state/result fingerprints.

The pure contract cannot determine global uniqueness. Database constraints remain required.

## Claim

Claim requires:

- current state `issued`;
- exact expected transition version;
- no active consumer;
- non-terminal and unexpired state;
- exact consumer ID/fingerprint;
- explicit observation timestamp before expiry.

It returns `active`, populated consumer fields, incremented transition version, and a `consumer_claimed` audit event.

## Stage Consumption

Stage consumption requires:

- state `active` or `partially_consumed`;
- exact active consumer;
- exact expected transition version;
- observed time before expiry;
- requested stage equals current stage;
- stage unconsumed;
- previous stage accepted except for stage `0`;
- exact stage grant fingerprint;
- exact process-request fingerprint;
- retry `0` and fallback `false`.

It records the stage as consumed before completion, increments consumed/remaining counters, keeps the current stage awaiting completion, and emits `stage_authority_consumed`.

This is only proposed fixture state. It is not atomic until a future database transaction enforces the same predicates.

## Completion

Stage completion requires exact consumed stage, process-request linkage, completion fingerprint, optional interpretation fingerprint, timestamp ordering, and closed outcome.

Accepted outcomes:

- `accepted`;
- `accepted_detached_observation`.

Rejected or failure outcomes terminalize to `failed_consumed`. Ambiguous process state terminalizes to `ambiguous_failed_consumed`.

## Detached Posture

`accepted_detached_observation` is permitted only for stage `3`, the branch-state observation stage. It may advance to stage `4`. No arbitrary non-zero exit is accepted.

## Aggregate

Aggregate finalization requires all six stages consumed and completed with accepted or exact detached observational outcome, current stage after stage `5`, exact active consumer, expected transition version, observed time before expiry, and aggregate fingerprint.

It terminalizes to `consumed` with reason `sequence_consumed`. It does not authorize runtime readiness.

## Expiry And Revocation

Expiry terminalization requires non-terminal state, exact transition version, and observed time at or after expiry. It returns `expired`.

Revocation requires non-terminal state, exact transition version, reviewed revocation reason, and revocation fingerprint. It returns `revoked`.

Consumed, failed, ambiguous-failed, expired, and revoked states do not reopen.

## CAS Model

Every non-registration transition requires:

- exact current-state fixture;
- exact current-state fingerprint;
- exact expected transition version;
- exact package/session/policy linkage through the state;
- exact operation-specific predicates.

The pure contract models compare-and-set predicates but does not make them atomic. Future database/RPC work must enforce equivalent predicates in one transaction.

## Invariants

State validation enforces:

- consumed plus remaining equals six;
- stage indexes are exact;
- six stage records exist;
- consumed flags and counters agree;
- completion cannot exist without consumption;
- active consumer nullability matches state;
- terminal states have terminal reason and time;
- non-terminal states have null terminal fields;
- retry is `0`;
- fallback is `false`;
- expired/revoked booleans match state;
- consumed state has aggregate fingerprint;
- non-consumed states do not;
- fingerprint correctness is necessary but insufficient.

## Result Union

The result union is closed:

- `transition_permitted`;
- `transition_rejected`.

Permitted results include the prior state fingerprint, the next-state core fingerprint, the final next-state fingerprint, expected/resulting transition versions, next state, audit events, status/reason, result fingerprint, `authority:"none"`, `runtimeActivated:false`, and `toctouEliminated:false`.

Rejected results include no next state and no accepted audit event.

## Reason Model

The reason enum is closed and includes schema/identity, linkage/CAS, timing, claim, stage, terminalization, and permitted reasons. There are no free-form reasons.

Precedence is deterministic: schema and identity failures precede package/state/fingerprint failures, which precede operation-specific state outcomes.

## Audit Model

The contract constructs immutable audit-event fixtures containing operation, package fingerprint, previous-state fingerprint, next-state core fingerprint, consumer/stage linkage where applicable, transition versions, status/reason, observed timestamp, evidence fingerprint, authority/runtime false posture, and audit fingerprint.

The audit event intentionally binds `nextStateCoreFingerprint` rather than the final `nextStateFingerprint`. The final state then stores the canonical audit event fingerprint in `lastAuditEventFingerprint`, and the final state fingerprint binds that event link. This keeps the graph acyclic while preserving exact returned-state linkage.

Audit events contain no raw paths, Git output, environment values, credentials, process handles, PIDs, SQL errors, Node errors, or stack traces.

## Timestamp Model

All timestamps must use canonical UTC `YYYY-MM-DDTHH:mm:ss.sssZ`. There is no internal clock. Offsets, missing milliseconds, noncanonical dates, and backward completion timestamps reject.

## Fingerprints

Deterministic SHA-256 fingerprints bind contract/policy identities, operation, package/policy fingerprints, current state, expected version, consumer, stage, timestamps, process/completion/interpretation/aggregate fingerprints, previous state, next-state core, final next state, audit events, status/reason, runtime flags, authority posture, and final result.

Fingerprints do not create atomicity or replay prevention.

## Atomicity And Replay Limits

The contract is pure. It cannot:

- prove global uniqueness;
- prevent replay;
- claim a lock;
- perform atomic compare-and-set;
- resolve concurrent consumers;
- persist audit;
- safely retry ambiguous storage outcomes.

Those limits require future database and server-only adapter Actions.

## Tests

The focused suite contains 43 tests covering registration, claim, stage consumption, completion, detached posture, aggregate finalization, expiry/revocation, explicit failure, CAS/version checks, state invariants, schema attacks, timestamp grammar, fingerprints, immutability, and pure/import closure.

## Export Surface

The module exports immutable identities/policies/domains, closed types, the transition builder, current-state fingerprint helper, consumption-key helper, and narrow fixture/test helpers. It exports no storage adapter, SQL/RPC helper, server-only wrapper, runtime runner, clock provider, database handle, replay reset, or authority-consumption implementation.

## Runtime Unreachability

No runtime caller was added. Static reachability review must continue to verify that app/API/UI/runner/cron/worker/CLI code does not import this contract as an activation path.

## Blockers Before Migration/RPC

- Independent static security and contract review;
- remediation and final re-review if required;
- exact SQL/RLS/RPC design and implementation;
- SQL static review;
- privilege and RLS review;
- database-error mapping review.

## Blockers Before Storage Adapter

- reviewed pure transition contract;
- reviewed migration/RPC package;
- server-only adapter design;
- service-role boundary proof;
- no-client reachability proof;
- storage ambiguity/read-back proof.

## Blockers Before Runner/Runtime/Deployment

- reviewed storage adapter;
- dormant runner planning;
- dormant runner implementation;
- static security review and final re-review;
- staging-only validation plan;
- separate runtime activation approval;
- separate deployment approval.

## Explicit Non-Authorizations

Action 615 does not authorize database readiness, replay safety, Git compatibility, repository inspection, Git execution, process creation or observation, authority consumption, runner implementation, runtime/API/UI activation, credentials, network, Avanza/trading behavior, persistence, staging, deployment, commit, push, merge, or deploy.

## Recommended Next Action

Action 616 - Static Security and Contract Review of Pure Dormant Git Authority Consumption Transition Contract.

## Action 617 Remediation Update

Action 617 remediated the Action 616 static-review findings without changing the contract identity or version.

The transition contract now:

- semantically revalidates the final-approved authority-package issuance result before registration;
- exact-closes `currentState.stages` with descriptor and prototype-chain array checks;
- enforces a complete consumed-pending-completion stage progression model;
- requires completion of the current consumed stage only;
- emits one audit event whose next-state core fingerprint matches the returned next state's `stateCoreFingerprint` and whose canonical event fingerprint is stored in `nextState.lastAuditEventFingerprint`;
- removes the generic exported test hash helper.

Focused tests increased from 43 to 73. The boundary remains pure, fixture-only, storage-free, non-atomic outside future storage, replay-unprotected outside future storage, and runtime-unreachable.

## Action 619 Audit Fingerprint Update

Action 619 remediated `A618-MED-001` without changing the contract identity or version. The transition graph is now acyclic:

1. semantic next-state fields produce `stateCoreFingerprint`;
2. the audit event binds `nextStateCoreFingerprint` and all final audit fields, then produces `eventFingerprint`;
3. the final next state stores `lastAuditEventFingerprint:eventFingerprint` and produces `stateFingerprint`;
4. the transition result binds both `nextStateCoreFingerprint` and final `nextStateFingerprint`.

Focused tests increased from 73 to 77 and now recompute every returned permitted audit event fingerprint from the emitted audit fields.
