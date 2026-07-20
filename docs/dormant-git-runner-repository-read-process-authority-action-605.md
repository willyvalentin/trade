# Action 605 - Repository-Read and Process Authority Plan for Dormant Git Runner

## Scope

Action 605 plans the smallest safe authority model required before a dormant read-only Git repository-observation runner can be implemented. It is documentation, architecture, capability-consumption, and approval-gate work only.

No authority consumption, runner implementation, Git execution, process creation, process observation, live repository inspection, compatibility behavior, observation behavior, aggregate behavior, parser behavior, completion behavior, resolver behavior, revalidation behavior, direct-spawn behavior, neutralization behavior, composition behavior, runtime/API/UI/cron/worker reachability, credentials, environment inheritance, network, Avanza/trading behavior, persistence, migration, deployment, retry, fallback, caching, commit, push, merge, or deploy behavior was added.

## Approved Baseline

The committed baseline through Action 604 contains:

- trusted executable resolution and immediate executable revalidation contracts;
- dormant live composition and fixed direct-spawn boundaries;
- fixed `/usr/bin/git` direct-spawn work for the exact Git-version path;
- spawn-to-raw-completion neutralization and raw process-completion evidence;
- generic and Apple Git-version interpretation contracts;
- final-approved pure read-only Git compatibility policy for version baseline `2.39.0`, major family `2`, upstream Git, and Apple Git;
- exact read-only Git capability tuples from Action 579;
- pure simple observation contracts for root, object format, HEAD, and branch state;
- pure byte-oriented porcelain status completion and interpretation;
- pure aggregate read-only Git repository observation;
- dormant runner architecture planning from Action 599.

What still does not exist:

- no six-stage runner authority package;
- no repository-read authorization;
- no process authority for the full sequence;
- no live Git repository-observation process execution;
- no authority consumption record;
- no runtime caller;
- no route, UI, cron, worker, CLI, package script, or deployment activation;
- no retries, fallback, caching, or TOCTOU elimination.

## Authority Trust Problem

A positive compatibility result proves only accepted parser evidence, supported implementation family, a Git version meeting the source-controlled baseline, and version compatibility for the exact read-only observation capability set. It does not prove or authorize the correct repository, an approved working directory, process creation, CLI execution, repository reading, output retention, result exposure, runtime activation, or deployment.

The authority model must never mint authority from compatibility, cleanliness, matching fingerprints, accepted pure evidence, aggregate observation, or review approval. Authority must be issued by a distinct source-controlled package and consumed stage-by-stage.

## Architecture Options

| Option | Shape | Assessment | Decision |
| --- | --- | --- | --- |
| A | One monolithic runner authority token. | Simple shape, but it blurs process, repository-read, output-retention, aggregate, exposure, and runtime authorities. A future caller could overinterpret one token as broad authorization. | Rejected |
| B | Separate capability grants consumed stage-by-stage. | Strong separation, but too many independently transferable artifacts and more replay/concurrency surface before storage semantics are designed. | Rejected for v1 |
| C | One sequence-scoped immutable authority package with narrowly separated sub-capabilities. | Preserves one sequence/session/worktree envelope while keeping each authority independently named, scoped, fingerprinted, and one-shot consumed by stage. | Selected |
| D | Runtime flag or configuration-based authorization. | Converts deployment/config state into authority and bypasses provenance, one-shot consumption, and exact command scope. | Rejected |

Selected architecture: Option C.

## Authority Package Identity

Planned immutable identities:

| Artifact | Planned identity |
| --- | --- |
| package contract kind | `dormant_git_repository_observation_authority_package_contract` |
| package contract ID | `ture.execution.dormant-git-repository-observation-authority-package.fixture.v1` |
| package policy ID | `ture.execution.dormant-git-repository-observation-authority-policy.v1` |
| capability-set ID | `ture.execution.read-only-git-repository-observation-capability-set.v1` |
| process authority ID | `ture.execution.git-runner.process-create-authority.fixed-read-only-six-stage.v1` |
| repository-read authority ID | `ture.execution.git-runner.repository-read-authority.approved-worktree-six-stage.v1` |
| CLI execution authority ID | `ture.execution.git-runner.cli-execution-authority.exact-read-only-git-tuples.v1` |
| text output-retention authority ID | `ture.execution.git-runner.output-retention-authority.bounded-text.v1` |
| byte output-retention authority ID | `ture.execution.git-runner.output-retention-authority.bounded-bytes.v1` |
| stage-evidence authority ID | `ture.execution.git-runner.stage-evidence-construction-authority.v1` |
| aggregate authority ID | `ture.execution.git-runner.aggregate-observation-authority.v1` |
| result-exposure authority ID | `ture.execution.git-runner.non-authoritative-result-exposure-authority.v1` |
| runtime-caller authority ID | `ture.execution.git-runner.runtime-caller-activation-authority.v1` |
| consumption-record ID | `ture.execution.git-runner.authority-consumption-record.v1` |
| sequence identity | `ture.execution.read-only-git-repository-observation.sequence.root-object-format-head-branch-status-head.v1` |

All identities must be source-controlled and fingerprint-bound. No identity can be caller-defined, environment-selected, database-selected, or inferred from compatibility evidence.

## Authority Input

The future authority-package issuer may consume one closed input containing only:

- approved executable resolution evidence;
- approved immediate executable revalidation evidence;
- final-approved compatibility-policy result with `compatible_for_read_only_observation`;
- approved worktree evidence or worktree-linkage evidence;
- exact capability-set identity and version;
- explicit execution session;
- explicit observation-sequence identity;
- exact source-controlled authority policy;
- issuance timestamp and expiry once approved;
- exact bounded output limits.

It must accept no arbitrary executable, cwd, argv, Git command, caller-selected capability, caller limit, caller compatibility result, caller authority boolean, caller expiry policy, caller retry/fallback policy, caller environment, dependency injection, clock provider, runtime state, process handle, raw output, parser option, or test mode.

## Prerequisites

Authority package issuance must require:

1. executable resolution evidence accepted;
2. executable revalidation evidence accepted;
3. exact executable `/usr/bin/git`;
4. compatibility result `compatible_for_read_only_observation`;
5. exact implementation family `upstream_git` or `apple_git`;
6. exact capability-set identity;
7. approved worktree evidence;
8. exact platform, policy, session, sequence, executable, and worktree linkage;
9. no credentials;
10. no network;
11. no mutation authority;
12. no write-command support;
13. `runtimeActivated:false`;
14. no existing consumed authority for the same package identity.

Compatibility is necessary but insufficient. It cannot become process authority, repository-read authority, output-retention authority, aggregate authority, exposure authority, runtime authority, staging readiness, or deployment permission.

## Exact Capability Scope

The only planned sequence:

| Stage | Stage grant | Exact argv | Output route |
| --- | --- | --- | --- |
| 1 | `git_repository_root_v1` | `["rev-parse", "--show-toplevel"]` | bounded text |
| 2 | `git_object_format_v1` | `["rev-parse", "--show-object-format"]` | bounded text |
| 3 | `git_head_before_v1` | `["rev-parse", "--verify", "HEAD"]` | bounded text |
| 4 | `git_branch_state_v1` | `["symbolic-ref", "--quiet", "--short", "HEAD"]` | bounded text |
| 5 | `git_porcelain_status_v1` | `["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]` | bounded bytes |
| 6 | `git_head_after_v1` | `["rev-parse", "--verify", "HEAD"]` | bounded text |

No authority exists for arbitrary Git commands, write commands, config commands, network commands, credential helpers, hooks, pathspecs, alternate flags, alternate executable, alternate cwd, reordered stages, skipped stages, or repeated stages beyond the exact sequence.

## Sub-Capability Model

Planned sub-capabilities:

| Sub-capability | Initial posture |
| --- | --- |
| `resolve_executable` | Planned prerequisite linkage only; future issuance may require accepted resolver evidence. |
| `revalidate_executable` | Planned prerequisite linkage only; future issuance may require immediate revalidation evidence. |
| `create_process` | Future stage-specific one-shot process creation grant only. |
| `execute_exact_read_only_git_command` | Future stage-specific exact argv grant only. |
| `read_approved_repository_state` | Future repository-read grant bound to approved worktree and exact command sequence only. |
| `retain_bounded_text_output` | Future bounded text retention for stages 1, 2, 3, 4, and 6 only. |
| `retain_bounded_byte_output` | Future bounded byte retention for porcelain stage only. |
| `construct_stage_evidence` | Future grant to construct approved pure stage evidence after neutralization/interpretation. |
| `construct_aggregate_observation` | Future grant to construct aggregate observation only after all exact stage evidence passes. |
| `expose_non_authoritative_result` | Future grant to expose one immutable non-authoritative result. |
| `activate_runtime_caller` | Must remain false and separately gated. |

Executable resolution/revalidation authority should be prerequisites before the package rather than broad mutable powers inside the runner. The package binds their evidence fingerprints and may carry only stage-specific consumption rights derived from them.

## Process Authority

Future process authority must bind:

- absolute executable `/usr/bin/git`;
- `shell:false`;
- no PATH lookup;
- exact argv from the fixed stage slot;
- approved cwd only;
- exact minimal non-secret environment policy, once separately approved;
- no stdin;
- one process at a time;
- six maximum process creations;
- no detached mode;
- no process group;
- no arbitrary signals;
- no retry;
- no fallback;
- no alternate executable;
- no child process after a terminal sequence outcome.

Each process creation attempt consumes exactly one stage-specific grant. A stage grant cannot be reused. Failure consumes the attempted stage authority. The sequence package cannot create more than six processes and cannot replenish later grants.

## Repository-Read Authority

Repository-read authority is separate from process authority. It must bind:

- approved worktree evidence fingerprint;
- exact cwd fingerprint;
- exact six read-only commands;
- exact session and sequence;
- exact executable;
- exact compatibility result;
- no write operation;
- no parent traversal;
- no alternate repository;
- no arbitrary path reading;
- no filesystem API authority;
- no raw file-content authority.

Git reading local repository state is repository access even when the command tuple is read-only. This authority grants no general filesystem read authority and no networked repository read authority.

## Output-Retention Authority

Text stages must have exact approved byte limits, stderr-empty requirements, no truncation, no raw Node errors, no plaintext path logging, and no long-term raw-output persistence.

The porcelain stage must keep the existing 65,536-byte stdout limit posture, zero-byte stderr requirement, byte-preserving internal routing, no UTF-8 decoding in the runner, no plaintext path logging, and no raw output persistence after approved evidence construction.

Retention lifecycle:

1. process bytes exist only inside the bounded collection boundary;
2. raw completion evidence is constructed;
3. interpreted evidence is constructed by the approved pure contract;
4. aggregate observation is constructed;
5. raw buffers/plain strings are discarded after approved evidence construction unless a separately reviewed non-persistent evidence retention rule requires fingerprint-only linkage.

No persistence authority exists.

## Authority Consumption

Planned package states:

- `issued`;
- `partially_consumed`;
- `consumed`;
- `failed_consumed`;
- `expired`;
- `revoked`;
- `rejected`.

Rules:

- one package per sequence;
- one stage grant per fixed slot;
- exact next-stage requirement;
- stage grant consumed at the process-attempt boundary;
- sequence stops after rejection;
- unused later grants become unusable after terminal failure;
- no replay;
- no clone-based reuse;
- no retry;
- no fallback;
- no package reset.

Consumption must be fingerprint-bound and auditable. Action 605 does not implement persistence, database locking, or storage.

## Replay and Concurrency

Replay risks include the same package used twice, parallel stage execution, stage reordering, duplicated process attempts, cloned fixture evidence, stale packages after worktree change, and concurrent runners using the same package.

Future enforcement must require a unique package identity, atomic consumption record, exact current-stage index, terminal-state lock, one active consumer, sequence fingerprint, expiry, and server-only storage if separately approved. Pure fingerprints alone cannot prevent replay.

## Expiry and Freshness

Authority packages require fixed short expiry plus immediate executable/worktree revalidation before consumption. Caller-selected expiry is rejected.

No approved numeric duration was found in the current baseline. Numeric expiry remains unresolved and must be decided before implementing authority issuance. Expiry does not eliminate TOCTOU; expired packages fail closed, and fresh packages still require immediate revalidation.

## Result Unions

Planned authority issuance statuses:

- `input_rejected`;
- `prerequisite_rejected`;
- `compatibility_rejected`;
- `worktree_rejected`;
- `authority_package_issued`.

Planned consumption statuses:

- `consumption_rejected`;
- `stage_authority_consumed`;
- `sequence_terminal_consumed`;
- `authority_expired`;
- `authority_revoked`;
- `replay_rejected`.

No status may be named generic `authorized` without scope. Positive issuance means only that the exact future authority package was constructed for the fixed read-only sequence. It does not mean runtime activation.

## Package Model

Planned package fields:

- package contract kind/version;
- policy identity/version;
- package ID;
- package fingerprint;
- capability-set identity/version;
- session;
- sequence identity;
- issuance evidence fingerprint;
- `issuedAt`;
- `expiresAt` or explicit unresolved expiry posture;
- executable resolution fingerprint;
- executable revalidation fingerprint;
- compatibility result fingerprint;
- worktree evidence fingerprint;
- executable `/usr/bin/git`;
- cwd fingerprint;
- platform;
- source policy identity/version;
- immutable sub-capability records for each permitted action;
- stage slots;
- current stage;
- consumed stage fingerprints;
- remaining stage identities;
- terminal state;
- `retryCount:0`;
- `fallbackAttempted:false`;
- `runtimeActivated:false`;
- `mutationAuthorityGranted:false`;
- `credentialsUsed:false`;
- `networkUsed:false`;
- `writeCommandCompatibility:false`;
- `toctouEliminated:false`;
- `deploymentAuthorityGranted:false`;
- `stagingAuthorityGranted:false`.

Plaintext paths should be avoided where fingerprints suffice.

## Reasons and Precedence

Closed reasons:

- `input_contract_rejected`;
- `input_identity_rejected`;
- `input_fingerprint_rejected`;
- `source_linkage_rejected`;
- `executable_resolution_rejected`;
- `executable_revalidation_rejected`;
- `compatibility_rejected`;
- `worktree_evidence_rejected`;
- `capability_set_rejected`;
- `platform_rejected`;
- `policy_rejected`;
- `authority_conflict_rejected`;
- `package_not_issued`;
- `package_expired`;
- `package_revoked`;
- `package_already_consumed`;
- `stage_order_rejected`;
- `stage_already_consumed`;
- `stage_capability_rejected`;
- `replay_rejected`;
- `concurrent_consumer_rejected`;
- `authority_package_issued`;
- `stage_authority_consumed`;
- `sequence_terminal_consumed`.

Precedence:

1. input schema;
2. identity;
3. fingerprint;
4. source/session/sequence linkage;
5. resolver evidence;
6. revalidation evidence;
7. compatibility result;
8. worktree evidence;
9. capability set;
10. platform and policy;
11. authority conflict;
12. package state;
13. expiry/revocation;
14. replay/concurrency;
15. stage order;
16. stage grant status;
17. positive issuance or consumption.

Earlier trust failures supersede authority outcomes. Unknown reasons fail closed.

## Fingerprinting

Future SHA-256 domains must bind package and policy identities, every prerequisite evidence fingerprint, compatibility result, worktree/executable/session/sequence linkage, exact stage capabilities, exact command tuples, output limits, issuance/expiry fields, consumption state, stage order, consumed and remaining grants, retry/fallback posture, all prohibited authority fields, audit linkage, and final result.

Fingerprints do not prevent replay without atomic consumption storage.

## Audit Model

Planned audit events:

- `package_issuance_attempted`;
- `package_issuance_rejected`;
- `package_issued`;
- `stage_consumption_attempted`;
- `stage_consumed`;
- `stage_rejected`;
- `sequence_terminal`;
- `package_expired`;
- `package_revoked`;
- `replay_rejected`.

Each event should include package fingerprint, stage identity, sequence identity, deterministic reason, timestamp, and source evidence fingerprints. Events must not include raw output, plaintext paths, credentials, environment values, process handles, process IDs, raw errors, or stack traces. Action 605 does not implement audit persistence.

## Runtime Unreachability

Future authority contracts and runner code must remain dormant:

- no app import;
- no API route;
- no UI import;
- no cron;
- no worker;
- no CLI;
- no package script;
- no deployment config;
- no production barrel;
- focused tests only.

Authority issuance itself must remain pure or dormant until separately approved.

## Next Action Decision

Options compared:

| Option | Decision |
| --- | --- |
| Implement pure authority-package issuance contract. | Deferred until expiry/freshness duration is decided. |
| Resolve fixed authority expiry duration. | Selected as earliest unresolved prerequisite. |
| Implement server-only atomic consumption storage. | Later, after package schema and expiry are approved. |
| Implement dormant runner. | Premature before authority issuance and consumption models are approved. |
| Activate runtime. | Rejected. |

Recommended next Action: Action 606 - Decide Fixed Expiry and Freshness Policy for Dormant Git Runner Authority.

## Test Strategy

Future tests must cover exact prerequisite evidence, exact compatibility result, exact worktree linkage, exact six-stage capability set, no arbitrary command/cwd, stage-specific grants, maximum six process attempts, one-shot consumption, stage order, stop after failure, no retry/fallback, replay rejection, concurrent consumer rejection, expiry, revocation, changed executable/worktree/session/sequence, changed compatibility evidence, output-retention limits, authority scope, no mutation/network/credentials/runtime, fingerprints, deep freeze, and no runtime caller.

## Future Gates

1. Authority package schema review.
2. Prerequisite evidence review.
3. Compatibility linkage review.
4. Worktree linkage review.
5. Exact capability-scope review.
6. Process-authority review.
7. Repository-read-authority review.
8. Output-retention-authority review.
9. Stage-consumption review.
10. Replay/concurrency review.
11. Expiry/freshness review.
12. Revocation review.
13. Audit/privacy review.
14. Fingerprint review.
15. Determinism/immutability review.
16. Export-surface review.
17. Runtime-reachability review.
18. Independent static security review.
19. Remediation and final re-review.
20. Server-only atomic consumption design.
21. Dormant runner implementation review.
22. Staging-only authority trial.
23. Runtime activation review.
24. Deployment approval.

## Explicit Non-Authorizations

Action 605 does not authorize Git execution, process creation, process observation, process termination, repository inspection, repository-read authority issuance, process authority issuance, CLI authority issuance, authority consumption, runner implementation, runtime/API/UI/cron/worker activation, credentials, inherited environment, network, Avanza/trading behavior, persistence, migrations, deployment, staging readiness, production readiness, retries, fallback, caching, commit, push, merge, or deploy.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- `npx playwright test tests/e2e/post-trade-pure-read-only-git-compatibility-policy-contract.spec.ts --reporter=dot`: 133 passed.
- `npx playwright test tests/e2e/post-trade-pure-git-version-interpretation-contract.spec.ts tests/e2e/post-trade-pure-apple-git-version-interpretation-contract.spec.ts tests/e2e/post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator.spec.ts --reporter=dot`: 146 passed.
- `npx playwright test tests/e2e/post-trade-pure-aggregate-read-only-git-repository-observation-contract.spec.ts tests/e2e/post-trade-pure-read-only-git-porcelain-status-interpretation-contract.spec.ts tests/e2e/post-trade-pure-byte-oriented-porcelain-status-completion-contract.spec.ts tests/e2e/post-trade-pure-read-only-git-simple-observation-contracts.spec.ts --reporter=dot`: 172 passed.
- `npx playwright test tests/e2e/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter.spec.ts tests/e2e/post-trade-pure-raw-process-completion-evidence-contract.spec.ts tests/e2e/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.spec.ts tests/e2e/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.spec.ts tests/e2e/post-trade-dormant-server-only-first-live-staging-preflight-composition-adapter.spec.ts tests/e2e/post-trade-first-live-read-only-staging-preflight-composition-contract.spec.ts --reporter=dot`: 143 passed.
- `npx playwright test tests/e2e/post-trade-trusted-live-resolver-adapter.spec.ts tests/e2e/post-trade-trusted-live-resolver-adapter-security-review.spec.ts tests/e2e/post-trade-execution-agent-cross-boundary-integration-readiness-review.spec.ts --reporter=dot`: 672 passed.
- `npx playwright test tests/e2e/post-trade-scoped-macos-process-observer.spec.ts tests/e2e/post-trade-scoped-macos-process-observer-security-review.spec.ts tests/e2e/post-trade-credential-source-adapter-boundary.spec.ts tests/e2e/post-trade-credential-source-adapter-boundary-security-review.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-credential-provider.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-cli-version-collector.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-process-executor.spec.ts tests/e2e/post-trade-first-live-read-only-preflight-authorization-artifact.spec.ts tests/e2e/post-trade-staging-execution-authorization-artifact.spec.ts tests/e2e/post-trade-durable-one-shot-authorization-consumption-contract.spec.ts tests/e2e/post-trade-durable-authorization-consumption-persistence-schema-design.spec.ts --reporter=dot`: 887 passed.
- Scoped ESLint on changed TypeScript/JavaScript files: not applicable; Action 605 changed documentation only.
- `git diff --check`: passed.
- Static production-source diff review: passed; no TypeScript or JavaScript files changed.
- Static authority-architecture review: passed.
- Static capability-scope review: passed.
- Static consumption/replay review: passed.
- Static expiry-policy review: passed with numeric duration unresolved and assigned to Action 606.
- Static export-surface review: passed; no production export added.
- Static runtime-reachability review: passed; no app/API/UI/runtime/runner import of Action 605 authority IDs exists.
- Static prohibited-operation review: passed; new hits are documentation-only non-authorization prose.
- Migration-suite baseline limitation check: unrelated missing migration baseline reconfirmed.
- `git diff -- .env.local --exit-code`: passed.
- `find docs -type f -size 0`: passed.

## Decision

Decision: `post_trade_dormant_git_runner_repository_read_process_authority_plan_ready`

Result status: `post_trade_dormant_git_runner_repository_read_process_authority_action_605_planning_gate_completed`

Recommended next Action: Action 606 - Decide Fixed Expiry and Freshness Policy for Dormant Git Runner Authority.

No deploy is recommended for Action 605. A source-control checkpoint commit may be considered only after the planning diff and validation are manually inspected.
