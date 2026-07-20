# Action 606 - Dormant Git Runner Authority Expiry and Freshness Policy

## Scope

Action 606 decides the fixed expiry and freshness policy needed before a future pure repository-read and process authority package can be implemented for the dormant read-only Git repository-observation runner.

This is documentation, policy-decision, threat-model, and approval-gate work only. No expiry checker, authority package, authority consumption, runner, Git execution, process creation, process observation, repository inspection, runtime/API/UI/cron/worker reachability, credentials, environment inheritance, network, Avanza/trading behavior, persistence, migrations, deployment, commit, push, merge, or deploy is added.

## Approved Baseline

- Action 605 selected one immutable sequence-scoped authority package with independent stage sub-capabilities and deferred the numeric expiry duration.
- Action 604 final-approved the pure read-only Git compatibility policy.
- Action 599 planned the dormant six-stage read-only Git runner.
- Actions 595-598 approved pure aggregate repository observation.
- Actions 581-593 approved pure Git simple, byte-completion, and porcelain status contracts.
- Resolver, composition, revalidation, direct-spawn, neutralization, raw-completion, and neutralization-to-Git interpretation remain separately scoped.

The currently approved future sequence remains:

1. `["rev-parse", "--show-toplevel"]`;
2. `["rev-parse", "--show-object-format"]`;
3. `["rev-parse", "--verify", "HEAD"]`;
4. `["symbolic-ref", "--quiet", "--short", "HEAD"]`;
5. `["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]`;
6. `["rev-parse", "--verify", "HEAD"]`.

## Threat Model

The expiry policy must limit the lifetime of a future authority package without pretending to eliminate time-of-check/time-of-use risk. The main threats are stale executable evidence, stale worktree evidence, replay of an unconsumed package, parallel consumption, caller-controlled time, clock rollback, stage continuation after expiry, compatibility evidence being treated as authority, and a successful historical result being misread as current readiness.

The policy is not a defense against every live filesystem race. It is a bounded lifetime constraint that must be paired with immediate executable and worktree revalidation before authority consumption.

## Expiry Options Reviewed

| Option | Decision | Rationale |
| --- | --- | --- |
| 15 seconds | Rejected for v1 | Short, but likely brittle for a six-stage sequence once process startup, output neutralization, parsing, and aggregate construction are included. |
| 30 seconds | Selected | Short enough to limit stale authority, long enough for the fixed six-stage read-only sequence under ordinary local conditions, and narrow compared with broader preflight authorization windows. |
| 60 seconds | Rejected for v1 | Easier operationally, but unnecessarily widens stale authority before any runner timing evidence exists. |
| Caller-selected expiry | Rejected | Caller input must not set, extend, shorten, or refresh authority. |
| Expiry unresolved | Rejected | Action 605 identified numeric expiry as the earliest prerequisite for the pure authority-package contract. |

## Selected Policy

Selected duration: `30000` milliseconds, exactly 30 seconds.

Policy identity:

`ture.execution.dormant-git-runner-authority-expiry-policy.v1`

Fixed duration identity:

`ture.execution.dormant-git-runner-authority-fixed-duration.30s.v1`

The future package must compute:

`expiresAt = issuedAt + 30000 ms`

Any other delta must reject. There is no extension, refresh, grace period, retry window, fallback window, cache window, or caller override.

## Timestamp Model

Future pure contracts may accept explicit timestamps only as structural inputs for deterministic validation. A future server-only issuer must own the actual time observation.

Required timestamp shape:

- UTC only;
- exact ISO-8601 millisecond form: `YYYY-MM-DDTHH:mm:ss.sssZ`;
- no timezone offsets other than `Z`;
- no local time;
- no leap seconds;
- no missing millisecond field;
- no non-date strings;
- no numeric timestamps.

Required fields for the future package model:

- `issuedAt`;
- `expiresAt`;
- `observedAt` for validation/evaluation;
- `firstConsumptionAttemptedAt` once consumption is attempted;
- `terminalAt` for terminal state evidence.

Time remains evidence only. It does not grant repository-read, process, CLI, runtime, staging, deployment, credential, network, or trading authority.

## Clock Trust Boundary

Clock policy identity:

`ture.execution.dormant-git-runner-trusted-time-boundary.v1`

The future server-only issuer may use a trusted server time source only after separate implementation review. Caller-supplied time, browser time, database time passed by a caller, environment-configured time, and test-mode clocks are not production authority.

Wall-clock UTC is used for audit and expiry identity. A future live consumer may additionally use monotonic elapsed time internally while it is consuming a package, but the monotonic handle must not become a transferable package field.

Clock rollback, skew, unavailable time, malformed time, or evaluation before `issuedAt` must fail closed.

## Issuance Freshness

Freshness policy identity:

`ture.execution.dormant-git-runner-authority-freshness-policy.v1`

The future authority package may be issued only after fresh executable and worktree checks in the same session and sequence. Compatibility evidence is necessary but insufficient. Compatibility may be reused only if it links exactly to the freshly revalidated executable fingerprint, session, platform, policy, and approved tool identity.

Changed executable evidence, changed worktree evidence, changed compatibility result, changed session, changed sequence, or changed policy invalidates issuance.

## Pre-Consumption Revalidation

Before any future stage process attempt, the consumer must verify:

- package is issued, unexpired, unrevoked, and not terminal;
- exact package identity, policy identity, fixed duration identity, and sequence identity;
- exact session, purpose, platform, executable, cwd, worktree, compatibility, and stage ordinal;
- immediate executable revalidation still matches the package;
- worktree linkage is still acceptable under the reviewed worktree contract;
- current stage grant has not already been consumed;
- no other active consumer owns the package;
- no retry, fallback, skipped stage, repeated stage, or reordered stage is requested.

Failure means no process may be created for that stage.

## Per-Stage Expiry

Expiry must be checked:

1. before package issuance result acceptance;
2. before each stage process attempt;
3. after each stage completion before any next stage starts;
4. before aggregate construction;
5. before non-authoritative result exposure.

If the package expires before a process is created, no process is created and the package enters a terminal expired state.

If a process was already created before expiry and returns after expiry, the future consumer may retain the bounded raw completion evidence for that attempted stage, but it must not start another stage and must not construct a complete aggregate result unless all six stages and aggregate construction completed before expiry.

Expiry must not send signals, schedule timers, create observers, or terminate processes. Timeout and termination are separate boundaries.

## Completion Deadline

The full six-stage sequence and aggregate construction must complete before `expiresAt` to return an accepted aggregate observation. Starting the sequence before expiry is insufficient.

An expiry after accepted aggregate construction does not retroactively invalidate the historical non-authoritative evidence, but it does end all unused authority and cannot authorize another repository read or process attempt.

## Terminal States

Required future terminal-state model:

- `issued`;
- `partially_consumed`;
- `consumed`;
- `failed_consumed`;
- `expired`;
- `revoked`;
- `replay_rejected`;
- `input_rejected`.

No terminal state may return to `issued`. There is no reset, reissue, refresh, replay, or package cloning path.

## Replay and Concurrency

Expiry alone does not prevent replay or concurrency. Future enforcement must require an atomic server-only consumption record with package identity, package fingerprint, session, sequence, current stage index, active-consumer state, terminal-state lock, and deterministic reason.

Two near-simultaneous consumption attempts must allow at most one consumer. Reentrant calls and duplicate calls with the same source package must reject after the first attempted consumption path, including interpretation or aggregate rejection.

## Revocation

Revocation is modeled as a terminal state but is not implemented by Action 606. A future revocation channel, if approved, must be server-only, atomic, fingerprint-bound, and nonrenewable.

Revoked packages fail before process creation. Revocation does not create process termination authority and does not imply any live observer or signal behavior.

## Result Union

Future pure expiry/freshness validation should use a closed result union:

- `input_rejected`;
- `timestamp_rejected`;
- `expiry_delta_rejected`;
- `authority_unexpired`;
- `authority_expired`;
- `authority_revoked`;
- `authority_already_consumed`;
- `stage_start_permitted`;
- `stage_start_rejected`;
- `aggregate_construction_permitted`;
- `aggregate_construction_rejected`;
- `replay_rejected`.

There is no generic `valid`, `ready`, `authorized`, `active`, `compatible`, or `live_ready` result.

## Reason Model and Precedence

Reasons are closed and deterministic:

- `input_contract_rejected`;
- `timestamp_grammar_rejected`;
- `issued_at_rejected`;
- `expires_at_rejected`;
- `expiry_delta_rejected`;
- `observed_at_rejected`;
- `package_not_issued`;
- `package_expired`;
- `package_revoked`;
- `package_already_consumed`;
- `package_failed_consumed`;
- `replay_rejected`;
- `concurrent_consumer_rejected`;
- `executable_revalidation_rejected`;
- `worktree_revalidation_rejected`;
- `compatibility_linkage_rejected`;
- `session_linkage_rejected`;
- `sequence_linkage_rejected`;
- `stage_order_rejected`;
- `stage_start_permitted`;
- `aggregate_construction_permitted`.

Precedence:

1. malformed input;
2. malformed timestamps;
3. wrong expiry delta;
4. wrong identity or policy;
5. session, sequence, executable, worktree, or compatibility linkage rejection;
6. revoked;
7. expired;
8. already consumed or failed consumed;
9. replay or concurrent consumer rejection;
10. stage-order rejection;
11. stage or aggregate permission result.

No raw Node errors, paths, process details, stdout, stderr, repository data, stacks, credentials, or environment values may appear in reasons.

## Policy Identities

The future authority package must bind these source-controlled identities:

- `ture.execution.dormant-git-runner-authority-expiry-policy.v1`;
- `ture.execution.dormant-git-runner-authority-fixed-duration.30s.v1`;
- `ture.execution.dormant-git-runner-authority-freshness-policy.v1`;
- `ture.execution.utc-iso8601-ms-time-representation.v1`;
- `ture.execution.dormant-git-runner-per-stage-expiry-check.v1`;
- `ture.execution.dormant-git-runner-trusted-time-boundary.v1`;
- `ture.execution.dormant-git-runner-authority-revocation-policy.v1`.

Caller input, environment variables, local configuration, runtime feature flags, package scripts, or deployment settings must not replace these identities.

## Fingerprinting

Future SHA-256 fingerprints must bind:

- package identity and version;
- expiry and freshness policy identities;
- fixed duration `30000`;
- timestamp grammar identity;
- `issuedAt`, `expiresAt`, `observedAt`, `firstConsumptionAttemptedAt`, and `terminalAt` where present;
- session, purpose, platform, sequence, stage ordinal, executable, cwd, worktree, compatibility, revalidation, and source evidence fingerprints;
- package state, consumed stages, active-consumer state, terminal state, revocation state, replay posture, and concurrency posture;
- result status and reason;
- every authority/security field fixed false or `none`;
- `toctouEliminated:false`;
- `runtimeActivated:false`.

Fingerprints prove deterministic linkage only. They do not create authority, freshness, replay protection, or live readiness.

## TOCTOU Limits

This policy does not eliminate TOCTOU. It intentionally requires `toctouEliminated:false`.

The 30-second window limits stale package lifetime. Immediate executable and worktree revalidation limits use of stale prerequisite evidence. Neither proves that a binary or repository remains unchanged after the final pre-spawn check.

Future spawn authority must independently revalidate the executable and worktree immediately before each process attempt.

## Authority and Runtime Limits

Action 606 grants no:

- repository-read authority;
- process creation authority;
- CLI execution authority;
- process observation authority;
- process termination authority;
- credential authority;
- network authority;
- compatibility authority;
- runtime/API/UI/cron/worker authority;
- Avanza/trading authority;
- persistence authority;
- migration authority;
- deployment authority.

The future package remains dormant until separately implemented and reviewed.

## Test Strategy

Future Action 607 tests should cover exact 30-second delta, malformed timestamps, wrong duration, evaluation before issuance, expiry before stage start, expiry after stage start but before next stage, expiry before aggregate construction, revoked state, consumed state, failed-consumed state, replay, concurrency, stage order, revalidation linkage, compatibility linkage, fingerprint mutation, authority fields, immutable results, and no runtime reachability.

Tests must not execute Git, create or observe a process, inspect a repository, read credentials, read environment values, use network, activate API/UI/runner code, or deploy.

## Review Gates

Required future gates:

1. Pure authority-package contract implementation.
2. Static security and contract review.
3. Remediation if findings exist.
4. Independent final re-review.
5. Separate server-only atomic consumption planning.
6. Separate atomic consumption implementation and review.
7. Separate dormant runner implementation and review.
8. Separate runtime activation approval.
9. Separate deployment approval.

## Validation Results

- `./node_modules/.bin/tsc --noEmit`: passed.
- `npx playwright test tests/e2e/post-trade-pure-read-only-git-compatibility-policy-contract.spec.ts --reporter=dot`: first sandbox attempt hit known Playwright `EPERM` on `test-results/.last-run.json`; minimal filesystem-escalated rerun passed, 133 tests.
- `npx playwright test tests/e2e/post-trade-pure-git-version-interpretation-contract.spec.ts tests/e2e/post-trade-pure-apple-git-version-interpretation-contract.spec.ts tests/e2e/post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator.spec.ts --reporter=dot`: passed, 146 tests.
- `npx playwright test tests/e2e/post-trade-pure-aggregate-read-only-git-repository-observation-contract.spec.ts tests/e2e/post-trade-pure-read-only-git-porcelain-status-interpretation-contract.spec.ts tests/e2e/post-trade-pure-byte-oriented-porcelain-status-completion-contract.spec.ts tests/e2e/post-trade-pure-read-only-git-simple-observation-contracts.spec.ts --reporter=dot`: passed, 172 tests.
- `npx playwright test tests/e2e/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter.spec.ts tests/e2e/post-trade-pure-raw-process-completion-evidence-contract.spec.ts tests/e2e/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.spec.ts tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts tests/e2e/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter.spec.ts tests/e2e/post-trade-first-live-read-only-staging-preflight-composition-contract.spec.ts --reporter=dot`: passed, 143 tests.
- `npx playwright test tests/e2e/post-trade-trusted-live-resolver-adapter.spec.ts tests/e2e/post-trade-trusted-live-resolver-adapter-security-review.spec.ts tests/e2e/post-trade-execution-agent-cross-boundary-integration-readiness-review.spec.ts --reporter=dot`: passed, 672 tests.
- `npx playwright test tests/e2e/post-trade-scoped-macos-process-observer.spec.ts tests/e2e/post-trade-scoped-macos-process-observer-security-review.spec.ts tests/e2e/post-trade-credential-source-adapter-boundary.spec.ts tests/e2e/post-trade-credential-source-adapter-boundary-security-review.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-credential-provider.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-cli-version-collector.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-process-executor.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-authorization-artifact.spec.ts tests/e2e/post-trade-staging-execution-authorization-artifact.spec.ts tests/e2e/post-trade-durable-one-shot-authorization-consumption-contract.spec.ts tests/e2e/post-trade-durable-authorization-consumption-persistence-schema-design.spec.ts --reporter=dot`: passed, 887 tests.
- Scoped ESLint on changed TypeScript/JavaScript files: not applicable; Action 606 changed documentation only.
- `git diff --check`: passed.
- Static source diff review: passed; no TypeScript or JavaScript files changed.
- Static threat-model, expiry-policy, clock-boundary, per-stage, replay/concurrency, export-surface, runtime-reachability, and prohibited-operation reviews: passed.
- Migration-suite baseline limitation check: unrelated missing migration baseline reconfirmed.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.

## Decision

Decision:
`post_trade_dormant_git_runner_authority_expiry_freshness_policy_ready`

Result status:
`post_trade_dormant_git_runner_authority_expiry_action_606_decision_gate_completed`

Recommended next Action:
Action 607 - Implement Pure Repository-Read and Process Authority Package Contract

No deploy is recommended for Action 606. A source-control checkpoint commit may be considered only after the documentation diff and validation are manually inspected.
