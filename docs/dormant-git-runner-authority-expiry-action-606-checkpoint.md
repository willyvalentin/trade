# Action 606 Checkpoint - Dormant Git Runner Authority Expiry and Freshness

## Scope

Action 606 decided the fixed expiry and freshness policy for a future dormant read-only Git runner authority package.

This was documentation, policy-decision, threat-model, and approval-gate work only. No expiry checker, authority package, authority consumption, runner, Git execution, process creation, process observation, live repository inspection, runtime/API/UI/cron/worker reachability, credentials, environment inheritance, network, Avanza/trading behavior, persistence, migrations, deployment, commit, push, merge, or deploy was added.

## Approved Baseline

- Action 605 selected one immutable sequence-scoped authority package and deferred numeric expiry.
- Action 604 final-approved the pure read-only Git compatibility policy.
- Action 599 planned the dormant six-stage read-only Git runner.
- Actions 595-598 approved the pure aggregate repository observation contract.
- Actions 581-593 approved pure read-only Git observation and parser contracts.

## Decision

Selected fixed authority lifetime:

`30000` milliseconds, exactly 30 seconds.

Policy identities:

- `ture.execution.dormant-git-runner-authority-expiry-policy.v1`;
- `ture.execution.dormant-git-runner-authority-fixed-duration.30s.v1`;
- `ture.execution.dormant-git-runner-authority-freshness-policy.v1`;
- `ture.execution.utc-iso8601-ms-time-representation.v1`;
- `ture.execution.dormant-git-runner-per-stage-expiry-check.v1`;
- `ture.execution.dormant-git-runner-trusted-time-boundary.v1`;
- `ture.execution.dormant-git-runner-authority-revocation-policy.v1`.

## Freshness and Consumption

Future package issuance must require fresh executable and worktree evidence in the same session, with compatibility linked exactly to the freshly revalidated executable and approved sequence.

Future consumption must check expiry before every stage process attempt, after each stage before continuing, before aggregate construction, and before result exposure. The complete six-stage sequence and aggregate construction must finish before expiry.

Expiry does not schedule timers, send signals, observe processes, terminate processes, refresh authority, or grant runtime readiness.

## Terminal State Model

Planned states:

- `issued`;
- `partially_consumed`;
- `consumed`;
- `failed_consumed`;
- `expired`;
- `revoked`;
- `replay_rejected`;
- `input_rejected`.

Terminal states are final. No reset, replay, reissue, refresh, retry, fallback, or package cloning is allowed.

## Authority Posture

The selected expiry policy grants no repository-read, process, CLI execution, observer, termination, credential, network, compatibility, runtime/API/UI/cron/worker, Avanza/trading, persistence, migration, staging, deployment, or production authority.

The policy requires `toctouEliminated:false` and `runtimeActivated:false`.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- Compatibility-policy suite: first sandbox attempt hit known Playwright `EPERM` on `test-results/.last-run.json`; minimal filesystem-escalated rerun passed, 133 tests.
- Generic Git parser, Apple Git parser, and Git-version orchestrator suites: passed, 146 tests.
- Aggregate, porcelain-status, byte-completion, and simple-observation suites: passed, 172 tests.
- Neutralization, raw-completion, direct-spawn, revalidation, dormant composition, and pure composition suites: passed, 143 tests.
- Resolver/security and Action 533 suites: passed, 672 tests.
- Broad dormant/process/credential/CLI/authorization suites: passed, 887 tests.
- Scoped ESLint on changed TypeScript/JavaScript files: not applicable; Action 606 changed documentation only.
- `git diff --check`: passed.
- Static source diff review: passed; no TypeScript or JavaScript files changed.
- Static threat-model, expiry-policy, clock-boundary, per-stage, replay/concurrency, export-surface, runtime-reachability, and prohibited-operation reviews: passed.
- Migration-suite baseline limitation check: unrelated missing migration baseline reconfirmed.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.

## Decision Record

Decision:
`post_trade_dormant_git_runner_authority_expiry_freshness_policy_ready`

Result status:
`post_trade_dormant_git_runner_authority_expiry_action_606_decision_gate_completed`

Recommended next Action: Action 607 - Implement Pure Repository-Read and Process Authority Package Contract.

No deploy is recommended for Action 606. A source-control checkpoint commit may be considered only after the documentation diff and validation are manually inspected.
