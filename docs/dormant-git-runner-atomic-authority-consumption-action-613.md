# Action 613 - Dormant Git Runner Atomic Authority Consumption Plan

## Scope

Action 613 plans the atomic one-shot consumption-record architecture for the final-approved pure dormant Git runner authority package. It is documentation, architecture, persistence-boundary, replay-prevention, concurrency, and approval-gate work only.

No consumption contract, database migration, persistence adapter, dormant Git runner, authority consumption, Git execution, process creation or observation, repository inspection, runtime/API/UI/cron/worker/CLI reachability, credentials, environment inheritance, network, Avanza/trading behavior, deployment, retry, fallback, caching, automatic reissue, commit, push, merge, or deploy is added.

## Approved Baseline

The committed baseline through Action 612 contains:

- final-approved pure dormant Git runner authority-package issuance contract;
- authority policy `ture.execution.dormant-git-runner.repository-read-process-authority.policy.v1`;
- complete authority policy fingerprint propagated into stage, package, and result fingerprints;
- six immutable stage grants for the exact read-only Git observation sequence;
- fixed `/usr/bin/git`, macOS, exact capability set, exact source-policy and worktree linkage;
- fixed 30000 ms authority lifetime with no extension, refresh, grace, retry, fallback, cache, or automatic reissue;
- initial package state `issued`, `currentStageIndex:0`, `consumedStageCount:0`, `remainingStageCount:6`, `activeConsumer:false`, `terminal:false`;
- explicit replay/storage limitations: no atomic replay protection, no storage, cloned packages are not live safe, and no concurrent consumer protection;
- final-approved compatibility policy, resolver, revalidation, direct-spawn, composition, neutralization, raw-completion, parser, simple/porcelain observation, and aggregate contracts.

What does not exist:

- no consumption record;
- no atomic claim;
- no active-consumer lock;
- no stage compare-and-set;
- no replay prevention;
- no persistence schema;
- no server-only consumption adapter;
- no runner;
- no runtime caller;
- no Git execution;
- no authority consumed live.

## Consumption Trust Problem

The immutable authority package proves exact structure and linkage, not uniqueness or atomicity. Without durable consumption state, the same package can be submitted twice, cloned, consumed by concurrent workers, used out of order, replayed after failure, or used after expiry/revocation by a caller racing with another caller.

Fingerprints establish integrity. They do not prove that a package has not already been used. Atomic storage must become the source of truth for consumption state. The consumption layer may only consume the exact grants already present in the final-approved package; it must not mint new capabilities.

## Architecture Options

| Option | Shape | Verdict |
| --- | --- | --- |
| A | Durable database-backed single consumption row per package with atomic compare-and-set transitions plus append-only audit events. | Selected. It binds semantic package state to uniqueness, concurrency, stage order, expiry, and audit evidence. |
| B | In-memory server lock only. | Rejected. It does not survive processes, deploys, crashes, or concurrent workers. |
| C | Append-only event log without current-state record. | Rejected for v1. Useful for audit, but insufficient alone for simple atomic stage predicates unless paired with derived locked state. |
| D | Caller-provided consumed-state object. | Rejected. It makes caller state authority and cannot prevent replay. |
| E | Generic distributed lock detached from package state. | Rejected. It can lock something, but not the exact stage/package semantics required for process authority. |

Selected architecture: durable Postgres/Supabase consumption record, deterministic unique consumption key, package registration before use, one active consumer, atomic compare-and-set stage transitions, stage consumed before process attempt, stage completion recorded separately, state transition and audit append in one transaction, terminal fail-closed states, no retry/reset, and server-only dormant access.

## Persistence Boundary

Future persistence must be a server-only boundary. It must accept only validated package/transition evidence, expose narrow transactional functions, never accept arbitrary SQL/table/state/stage/reason input, never return raw database errors, and remain unreachable from app/API/UI/runner until separately approved.

Preferred storage posture: Supabase/Postgres transactional function or RPC, because this repository already has Supabase migration, RLS, no-client-policy, and service-role isolation patterns. Direct Postgres could be considered only if separately approved. Pure modules must not import service-role credentials or clients.

## Record Identity And Uniqueness

Planned immutable identities:

| Artifact | Planned identity |
| --- | --- |
| consumption-record contract | `ture.execution.dormant-git-runner-authority-consumption-record.contract.v1` |
| consumption policy | `ture.execution.dormant-git-runner-authority-consumption.policy.v1` |
| storage schema | `ture.execution.dormant-git-runner-authority-consumption.schema.v1` |
| transition policy | `ture.execution.dormant-git-runner-authority-consumption-transition.policy.v1` |
| audit-event identity | `ture.execution.dormant-git-runner-authority-consumption-audit-event.v1` |
| replay policy | `ture.execution.dormant-git-runner-authority-replay-prevention.policy.v1` |
| concurrency policy | `ture.execution.dormant-git-runner-authority-concurrency.policy.v1` |
| terminal-state policy | `ture.execution.dormant-git-runner-authority-terminal-state.policy.v1` |

Canonical uniqueness key:

- derived deterministic `consumptionKey = sha256(consumption-key-domain, packageId + packageFingerprint)`;
- package ID unique;
- package fingerprint immutable;
- package ID plus package fingerprint unique;
- package ID with a different fingerprint rejects;
- same fingerprint under a different package ID rejects unless a future policy explicitly permits it.

The key also binds authority package ID, package fingerprint, authority policy fingerprint, session, sequence identity, executable fingerprint, worktree fingerprint, and compatibility result fingerprint. No upsert may overwrite existing records.

## Registration Model

Registration is required before any stage can be consumed:

1. validate the complete final-approved authority package;
2. derive the deterministic consumption key;
3. create exactly one consumption record in state `issued`;
4. enforce uniqueness atomically;
5. reject duplicates rather than silently treating them as success.

Duplicate behavior:

- same package ID and same fingerprint: `duplicate_registration_rejected`;
- same package ID and different fingerprint: `package_identity_conflict_rejected`;
- same fingerprint under another package ID: `package_fingerprint_reuse_rejected`.

## State Model

Durable states:

- `issued`: registered, no consumer, stage 0 pending;
- `active`: one consumer claimed the package, no stage attempt committed yet;
- `partially_consumed`: at least one stage attempt consumed, later stages remain;
- `consumed`: all six stage grants and aggregate finalization consumed successfully;
- `failed_consumed`: sequence terminally failed after an attempted stage;
- `expired`: terminal expiry before completion;
- `revoked`: terminal revocation.

`replay_rejected` and `conflict_rejected` should be audit outcomes, not mutable package states, unless a later schema review proves a safer reason to persist them as state. No transition returns to an earlier state. There is no reset, refresh, retry, or grant replenishment.

## Active Consumer

Planned fields:

- consumer ID;
- consumer fingerprint;
- claimedAt;
- lastTransitionAt;
- claim version;
- current stage;
- lease posture.

Lease decision: defer numeric lease. The initial architecture uses a persistent active-consumer claim plus transition-version checks. The 30-second package expiry bounds package authority but is not automatically a safe lease. If a lease is later introduced, it must be fixed, source-controlled, non-caller-selected, and reviewed separately.

## Stage Consumption Boundary

A stage grant becomes consumed immediately before the corresponding process-creation attempt. Durable consumption must commit before process creation. If persistence fails, no process may be created. Once persisted, the stage remains consumed even if process creation fails or the runner crashes ambiguously.

This gives at-most-once process-attempt semantics. It may lose a stage if infrastructure fails after durable consumption but before process creation. That is safer than creating the process twice.

## Compare-And-Set Transitions

Each stage-consumption transition must atomically check:

- record identity, consumption key, package ID, package fingerprint, and policy fingerprint match;
- current state is `issued`, `active`, or `partially_consumed` as allowed;
- active consumer matches;
- currentStageIndex equals expected stage;
- stage is not already consumed;
- package is not expired, revoked, or terminal;
- observed time is before expiry;
- transition version matches;
- retry count remains 0;
- fallback remains false.

The same transaction marks the stage consumed, stores stage-attempt fingerprint, advances currentStageIndex, increments consumedStageCount, decrements remainingStageCount, sets state, increments transition version, and appends the audit event. No separate read-then-write race is allowed.

## Process-Attempt Linkage

The future direct-spawn boundary must require exact durable stage-consumption evidence before process creation. The evidence must bind:

- stage-consumption record fingerprint;
- stage identity and index;
- process-attempt request fingerprint;
- direct-spawn request fingerprint;
- consumer fingerprint;
- package fingerprint;
- consumedAt.

Generic proof that some stage was consumed is insufficient.

## Stage Completion

Stage consumption and stage completion are separate transitions:

- consumption happens before the process attempt;
- completion records terminal raw/completion/interpreted evidence after the attempt;
- next stage cannot be consumed until prior stage completion is terminal accepted, except the exact detached-branch observational outcome;
- rejected or failed stages terminalize as `failed_consumed`;
- no partial aggregate is constructed.

Completion fields should include completion evidence fingerprint, interpreted evidence fingerprint or null, outcome, reason, completedAt, and next-stage eligibility.

## Detached Branch

Stage 3 (`symbolic-ref --quiet --short HEAD`, zero-based index 3 in the package) is consumed like every other stage. Its approved detached observational completion may be treated as accepted stage evidence. Status and HEAD-after stages may continue, and final aggregate may return `detached_head`. Arbitrary nonzero exits are not accepted.

## Expiry And Revocation

Action 606 applies exactly:

- check expiry before registration where applicable;
- check before consumer claim;
- check before every stage consumption;
- check before aggregate construction;
- expired before stage consumption means no process attempt and terminal `expired`;
- if a stage was consumed and process began before expiry but completes after expiry, completion may be recorded, but no new stage begins and the package terminalizes expired;
- if all six stages completed but aggregate construction begins after expiry, aggregate finalization rejects and the package terminalizes expired;
- `consumed` and `failed_consumed` do not later become expired.

Revocation is a terminal storage transition requiring exact package identity, expected transition version, deterministic reason, revokedAt, and no process starting after the transition. Race precedence must be enforced atomically. Recommended precedence: malformed identity/input first, terminal state second, revocation/expiry before new stage consumption, then stage order/concurrency predicates.

## Crash And Ambiguity

Fail-closed rules:

- never reopen a consumed stage;
- never infer success from a missing response;
- no automatic retry;
- no automatic stage replay;
- no reset;
- no fallback;
- no inferred aggregate;
- audit exact ambiguity reason;
- future operator remediation requires a separate reviewed Action.

`failed_consumed` plus exact reason is sufficient for v1. Reserve `ambiguous_failed_consumed` unless schema design proves it materially improves recovery without widening replay.

## Replay And Concurrency

Reject and audit:

- duplicate registration;
- second consumer claim;
- wrong consumer;
- stale transition version;
- same stage twice;
- earlier/later stage;
- package clone;
- different package fingerprint under same ID;
- same package fingerprint under another ID;
- transition after terminal state;
- concurrent stage requests.

Failed replay attempts must not mutate the valid record except through a separately approved audit-event append.

## Result Unions

Registration:

- `registration_input_rejected`;
- `package_registered`;
- `duplicate_registration_rejected`;
- `package_identity_conflict_rejected`;
- `package_fingerprint_reuse_rejected`.

Consumer claim:

- `claim_input_rejected`;
- `consumer_claimed`;
- `concurrent_consumer_rejected`;
- `package_not_claimable`;
- `package_expired`;
- `package_revoked`.

Stage consumption:

- `stage_consumption_rejected`;
- `stage_authority_consumed`;
- `stage_order_rejected`;
- `stage_already_consumed`;
- `wrong_consumer_rejected`;
- `stale_transition_rejected`;
- `package_terminal_rejected`;
- `package_expired`;
- `package_revoked`.

Stage completion:

- `completion_record_rejected`;
- `stage_completion_recorded`;
- `stage_failed_terminal`;
- `next_stage_permitted`;
- `sequence_terminal`.

Aggregate finalization:

- `aggregate_finalization_rejected`;
- `aggregate_consumption_recorded`;
- `sequence_consumed`;
- `package_expired`;
- `package_revoked`.

No generic `success`, `ready`, `authorized`, or `compatible` status is allowed.

## Reasons And Precedence

Closed reasons include `input_contract_rejected`, `input_identity_rejected`, `input_fingerprint_rejected`, `package_not_registered`, `duplicate_registration_rejected`, `package_identity_conflict_rejected`, `package_fingerprint_reuse_rejected`, `package_expired`, `package_revoked`, `package_already_consumed`, `package_failed_consumed`, `concurrent_consumer_rejected`, `wrong_consumer_rejected`, `stale_transition_rejected`, `stage_order_rejected`, `stage_already_consumed`, `stage_capability_rejected`, `stage_prerequisite_rejected`, `stage_authority_consumed`, `stage_completion_recorded`, `stage_failed_terminal`, `aggregate_prerequisite_rejected`, `aggregate_consumption_recorded`, `replay_rejected`, `ambiguous_process_state`, and `sequence_consumed`.

Precedence:

1. malformed input;
2. identity/version mismatch;
3. fingerprint/linkage mismatch;
4. package registration/uniqueness conflicts;
5. terminal state, expiry, or revocation;
6. consumer mismatch/concurrency;
7. stale transition version;
8. stage order or already-consumed stage;
9. stage prerequisite/capability failure;
10. accepted transition reason.

## Record Model

Record fields:

- identity: record ID, schema identity/version, package ID, package fingerprint, authority policy fingerprint, deterministic consumption key, record fingerprint;
- linkage: session, sequence identity, executable fingerprint, worktree fingerprint, compatibility fingerprint, issuedAt, expiresAt;
- state: state, currentStageIndex, consumedStageCount, remainingStageCount, stage consumed booleans/fingerprints, active consumer or null, transition version, terminal, terminal reason, revoked, expired, createdAt, updatedAt, terminalAt;
- attempts/completions: stage-attempt fingerprints, direct-spawn request fingerprints, completion fingerprints, interpretation fingerprints, aggregate fingerprint;
- security: retryCount 0, fallbackAttempted false, replayDetected posture, runtimeActivated false, toctouEliminated false.

Do not store raw output, plaintext paths, credentials, environment, process handles, Node errors, database errors, or stack traces.

## Audit Events

Append-only event types:

- `registration_attempted`;
- `package_registered`;
- `registration_rejected`;
- `consumer_claim_attempted`;
- `consumer_claimed`;
- `claim_rejected`;
- `stage_consumption_attempted`;
- `stage_consumed`;
- `stage_completion_recorded`;
- `stage_failed_terminal`;
- `expiry_terminalized`;
- `revocation_terminalized`;
- `replay_rejected`;
- `concurrency_rejected`;
- `aggregate_consumed`;
- `sequence_terminal`.

Each event stores record/package fingerprints, consumer fingerprint, stage identity/index, transition version before/after, status/reason, evidence fingerprints, timestamps, and no raw output or paths. Record mutation and audit append must be one transaction.

## Privacy And Retention

Store only bounded identifiers, states, reasons, counts, and fingerprints. Do not store plaintext repository paths, porcelain paths, raw Git stdout/stderr, environment, credentials, process handles, raw Node/database errors, or stack traces.

Retention duration is unresolved and must be decided separately.

## Storage Authority

Separate future authorities:

- register consumption record;
- claim consumer;
- consume exact stage grant;
- record exact stage completion;
- terminalize failure/expiry/revocation;
- finalize aggregate consumption;
- append audit event;
- read current consumption state.

There is no generic table-write authority, client-side storage authority, authority to modify unrelated execution records, or runtime activation.

## Migration And Schema Assessment

The absent `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` is for the older staging execution-authorization consumption path and target table `public.execution_authorization_consumptions`. It is directly relevant as a precedent for one-shot compare-and-set design, RLS, no-client access, and transactional function posture, but it is not reusable as the Git runner authority-consumption schema.

The Git runner needs a separate schema design, likely with at least:

- one current-state consumption record table;
- one append-only audit-event table or a transactionally linked audit table;
- a transactional function/RPC design for registration, claim, stage consumption, completion, terminalization, and aggregate finalization.

Do not create or resurrect the missing authorization migration in Action 613.

## Test Strategy

Future tests should cover unique registration, duplicate registration, ID/fingerprint conflict, fingerprint reuse, consumer claim, concurrent claim, exact stage order, stage consumed once, stale transition version, wrong consumer, expiry, revocation, process attempt after durable consumption only, crash ambiguity, stage failure terminalization, detached branch continuation, aggregate finalization, no retry/reset, replay, transaction rollback, audit event atomicity, privacy, deterministic fingerprints, and no runtime caller.

## Future Gates

1. Record schema review.
2. Unique-key review.
3. Package-registration review.
4. Consumer-claim review.
5. Compare-and-set transition review.
6. Stage-consumption-boundary review.
7. Process-attempt linkage review.
8. Stage-completion review.
9. Expiry/revocation precedence review.
10. Crash/ambiguity review.
11. Replay/concurrency review.
12. Audit atomicity review.
13. Privacy/retention review.
14. Storage-authority review.
15. RLS/service-role review.
16. Pure transition-contract review.
17. Migration/RPC review.
18. Server-only storage-adapter review.
19. Independent static security review.
20. Remediation and final re-review.
21. Dormant runner implementation review.
22. Staging-only trial.
23. Runtime activation review.
24. Deployment approval.

## Next Action

Recommended next Action: Action 614 - Design Atomic Consumption Storage Schema and Transaction Contract.

Reason: no Git runner authority-consumption schema or transactional RPC contract exists. The older authorization-consumption migration is absent and targets a different table and trust problem.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-runner-authority-package-contract.spec.ts --reporter=dot`: first sandbox attempt hit known Playwright `EPERM` on `test-results/.last-run.json`; minimal filesystem-escalated rerun passed, 155 tests.
- `npx playwright test tests/e2e/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.spec.ts tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts tests/e2e/post-trade-trusted-live-resolver-adapter.spec.ts tests/e2e/post-trade-trusted-live-resolver-adapter-security-review.spec.ts --reporter=dot`: passed, 540 tests.
- `npx playwright test tests/e2e/post-trade-pure-read-only-git-compatibility-policy-contract.spec.ts tests/e2e/post-trade-pure-git-version-interpretation-contract.spec.ts tests/e2e/post-trade-pure-apple-git-version-interpretation-contract.spec.ts tests/e2e/post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator.spec.ts --reporter=dot`: passed, 279 tests.
- `npx playwright test tests/e2e/post-trade-pure-aggregate-read-only-git-repository-observation-contract.spec.ts tests/e2e/post-trade-pure-read-only-git-porcelain-status-observation-contract.spec.ts tests/e2e/post-trade-pure-byte-oriented-porcelain-status-completion-contract.spec.ts tests/e2e/post-trade-pure-read-only-git-simple-observation-contracts.spec.ts tests/e2e/post-trade-pure-read-only-git-porcelain-status-interpretation-contract.spec.ts --reporter=dot`: passed, 172 tests.
- `npx playwright test tests/e2e/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter.spec.ts tests/e2e/post-trade-pure-raw-process-completion-evidence-contract.spec.ts tests/e2e/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.spec.ts tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts tests/e2e/post-trade-first-live-read-only-staging-preflight-composition-contract.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-process-executor.spec.ts --reporter=dot`: passed, 135 tests.
- `npx playwright test tests/e2e/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter.spec.ts tests/e2e/post-trade-first-live-read-only-staging-preflight-composition-contract.spec.ts tests/e2e/post-trade-trusted-live-resolver-adapter.spec.ts tests/e2e/post-trade-trusted-live-resolver-adapter-security-review.spec.ts tests/e2e/post-trade-execution-agent-cross-boundary-integration-readiness-review.spec.ts --reporter=dot`: passed, 702 tests.
- Broad dormant/process/credential/CLI/authorization regression excluding the known missing-migration static test: passed, 2591 tests.
- Scoped ESLint on changed TypeScript/JavaScript files: not applicable; Action 613 changed documentation only.
- `git diff --check`: passed.
- Static production-source diff review: passed; no production TS/JS changed.
- Static consumption-architecture, CAS/atomicity, replay/concurrency, crash/ambiguity, privacy/storage-authority, migration-baseline, export-surface, runtime-reachability, and prohibited-operation reviews completed.
- Runtime-reachability scan found no source caller for Action 613 architecture identifiers.
- Prohibited-operation scan over changed Action 613 docs found planning/non-authorization text only, not executable code.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.
- Missing migration baseline check: passed; `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` remains absent.

## Decision

`post_trade_dormant_git_runner_atomic_authority_consumption_plan_ready`

## Result Status

`post_trade_dormant_git_runner_atomic_authority_consumption_action_613_planning_gate_completed`

## Explicit Non-Authorizations

Action 613 does not authorize Git execution, process creation or observation, repository inspection, authority consumption, replay prevention implementation, storage implementation, runner implementation, runtime/API/UI activation, credentials, environment, network, Avanza/trading, persistence, migrations, staging, deployment, commit, push, merge, or deploy.

## Commit And Deploy

No deploy is recommended for Action 613. A source-control checkpoint commit may be considered only after the documentation diff and validation are manually inspected.
