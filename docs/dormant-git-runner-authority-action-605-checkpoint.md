# Action 605 Checkpoint - Dormant Git Runner Repository-Read and Process Authority Plan

## Scope

Action 605 planned the repository-read and process authority model required before implementing a dormant read-only Git repository-observation runner.

No authority package, authority consumption, runner, Git execution, process creation, process observation, live repository inspection, runtime/API/UI/cron/worker reachability, credentials, environment inheritance, network, Avanza/trading behavior, persistence, migrations, deployment, commit, push, merge, or deploy was added.

## Approved Baseline

- Action 604 final-approved the pure read-only Git compatibility policy.
- Action 599 planned the dormant six-stage runner but deferred repository-read and process authority.
- Actions 595-598 approved pure aggregate repository observation.
- Actions 581-593 approved pure simple, byte-completion, and porcelain status contracts.
- Action 579 fixed the exact read-only Git capability tuples.
- Resolver, composition, revalidation, direct-spawn, neutralization, and raw-completion boundaries remain separately scoped and dormant.

## Selected Authority Architecture

Selected: one immutable sequence-scoped authority package with independent sub-capabilities, exact session/worktree/executable/compatibility/sequence linkage, stage-specific one-shot consumption, no caller overrides, no generic command authority, and no runtime activation authority.

Rejected:

- monolithic runner token;
- loose independent grants as the v1 package shape;
- runtime flag/config authorization;
- runner implementation before authority issuance and consumption are approved.

## Capability Scope

The authority model binds only the fixed six-stage sequence:

1. `rev-parse --show-toplevel`;
2. `rev-parse --show-object-format`;
3. `rev-parse --verify HEAD`;
4. `symbolic-ref --quiet --short HEAD`;
5. `status --porcelain=v1 -z --untracked-files=all --no-renames --ignore-submodules=none`;
6. `rev-parse --verify HEAD`.

No arbitrary command, pathspec, alternate cwd, alternate executable, write command, network command, credential helper, hook, retry, fallback, or reordered/skipped/repeated stage authority is planned.

## Authority Model

Sub-capabilities planned:

- executable resolution linkage;
- executable revalidation linkage;
- process creation;
- exact read-only Git CLI execution;
- approved-worktree repository read;
- bounded text output retention;
- bounded byte output retention;
- stage-evidence construction;
- aggregate observation;
- non-authoritative result exposure;
- runtime caller activation, fixed false and separately gated.

Compatibility is necessary but insufficient and grants no authority by itself.

## Expiry and Next Action

Fixed short expiry plus immediate executable/worktree revalidation is the safest posture. No approved numeric duration exists in the current baseline, so numeric expiry remains unresolved.

Recommended next Action: Action 606 - Decide Fixed Expiry and Freshness Policy for Dormant Git Runner Authority.

## Validation

- `./node_modules/.bin/tsc --noEmit`;
- compatibility-policy suite: 133 passed;
- generic Git parser, Apple Git parser, and Git-version orchestrator suites: 146 passed;
- aggregate, porcelain-status, byte-completion, and simple-observation suites: 172 passed;
- neutralization, raw-completion, direct-spawn, revalidation, dormant composition, and pure composition suites: 143 passed;
- resolver/security and Action 533 suites: 672 passed;
- broad dormant/process/credential/CLI/authorization suites: 887 passed;
- scoped ESLint on changed TypeScript/JavaScript files: not applicable; Action 605 changed documentation only;
- `git diff --check`: passed;
- static production-source diff review: passed; no TypeScript or JavaScript files changed;
- static authority-architecture, capability-scope, consumption/replay, expiry-policy, export-surface, runtime-reachability, and prohibited-operation reviews: passed;
- migration-suite baseline limitation check: unrelated missing migration baseline reconfirmed;
- quiet `.env.local` diff guard: passed;
- `find docs -type f -size 0`: passed.

## Decision

Decision: `post_trade_dormant_git_runner_repository_read_process_authority_plan_ready`

Result status: `post_trade_dormant_git_runner_repository_read_process_authority_action_605_planning_gate_completed`

Recommended next Action: Action 606 - Decide Fixed Expiry and Freshness Policy for Dormant Git Runner Authority.

No deploy is recommended for Action 605. A source-control checkpoint commit may be considered only after the planning diff and validation are manually inspected.
