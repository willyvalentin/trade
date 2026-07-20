# Action 599 Checkpoint - Dormant Read-Only Git Repository Observation Runner Plan

## Action

Action 599 - Plan Dormant Read-Only Git Repository Observation Runner.

## Environment

- workspace: `/Users/willysimonsson/Dev/trade-action-534`;
- branch: `codex/action-534-live-resolver`;
- baseline HEAD at start: `4e3a98f Add reviewed aggregate Git repository observation contract`;
- initial worktree: clean.

## Files Created

- `docs/dormant-read-only-git-repository-observation-runner-action-599.md`;
- `docs/dormant-read-only-git-repository-observation-runner-architecture-action-599.md`;
- `docs/dormant-read-only-git-repository-observation-runner-action-599-checkpoint.md`.

## Files Modified

- `docs/ture-agent-dev-chat-3-continuation-summary.md`.

## Approved Chain Checkpoint

The approved chain through Action 598 has reviewed resolver/composition/revalidation/direct-spawn/neutralization/raw-completion/simple-observation/porcelain-status/aggregate contracts. It has not implemented a repository-observation runner, compatibility evaluator, repository-read authorization consumption, runtime caller, API/UI path, deployment path, credential path, or broad Git command support.

## Runner Trust Problem

The future runner must preserve original direct-spawn object provenance, one-shot source consumption, strict command order, text/byte output routing, pure interpretation, aggregate finalization, and non-authoritative results. It must not accept caller-supplied executable paths, argv, cwd, stdout, stderr, byte arrays, parser options, compatibility rules, clocks, process handles, dependency injection, or retry/fallback settings.

## Exact Ordering

The planned sequence is:

1. `["rev-parse", "--show-toplevel"]`
2. `["rev-parse", "--show-object-format"]`
3. `["rev-parse", "--verify", "HEAD"]`
4. `["symbolic-ref", "--quiet", "--short", "HEAD"]`
5. `["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]`
6. `["rev-parse", "--verify", "HEAD"]`

Stages 1, 2, 3, 4, and 6 are text-oriented. Stage 5 is byte-oriented.

## Architecture Decision

Preferred future architecture: one narrow dormant server-only six-stage runner with a fixed source-controlled stage catalog, exact `/usr/bin/git`, exact one-shot direct-spawn boundaries, approved neutralization/completion routes, approved pure interpreters, and pure aggregate finalization.

Rejected alternatives: per-stage live runner plus coordinator, extending the Git-version orchestrator, caller-configurable Git graph, and runtime activation.

## Source Eligibility

The future runner should accept only a closed capability package produced by separately reviewed gates. It should not accept raw paths, raw repository facts, raw process output, individual stage objects from callers, environment-derived values, or compatibility decisions.

## Result Model

Planned closed statuses:

- `runner_input_rejected`;
- `runner_stage_rejected`;
- `runner_interpretation_rejected`;
- `runner_aggregate_rejected`;
- `runner_observation_accepted_non_authoritative`.

All results must keep authority `none`, compatibility decision null, runtime/deployment authority false, and `toctouEliminated:false`.

## Compatibility Dependency

The read-only Git compatibility baseline remains unresolved for repository observation. Action 599 therefore recommends completing the compatibility baseline decision before implementing even a dormant runner skeleton.

## Explicit Non-Authorizations

Action 599 did not authorize Git execution, live repository inspection, process creation, process observation, process termination, CLI-version collection, repository-observation collection, compatibility evaluation, runtime/API/UI/runner activation, credentials, environment access, network, Avanza, trading, orders, positions, settlement retrieval, persistence, migrations, deployment, commit, push, merge, retries, fallback, or broad Git command support.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed;
- aggregate suite: first sandbox attempt hit known Playwright `EPERM` on `test-results/.last-run.json`; escalated rerun passed, 48 tests;
- Git parser/completion group: passed, 250 tests;
- dormant direct-spawn/revalidation/neutralization/raw-completion/composition group: passed, 163 tests;
- resolver/security and Action 533 group: passed, 672 tests;
- broad dormant/process/credential/CLI/authorization group: passed, 887 tests;
- scoped ESLint on changed TS/JS files: not applicable because no TypeScript or JavaScript files changed;
- static production-source diff review: passed, no TypeScript or JavaScript files changed;
- static export-surface review: passed, no app/lib/test/package references to the planned runner;
- static runtime-reachability review: passed, no runtime/API/UI/runner caller added;
- static prohibited-operation review: passed, documentation-only prohibition references only and no changed production source;
- `git diff --check`: passed;
- quiet `.env.local` diff guard: passed;
- `find docs -type f -size 0`: passed.

Playwright emitted existing `[DEP0205] module.register()` and `NO_COLOR`/`FORCE_COLOR` warnings during suites; these were not failures.

## Decision

Decision: `post_trade_dormant_read_only_git_repository_observation_runner_plan_ready`

Result status: `post_trade_dormant_read_only_git_repository_observation_runner_action_599_planning_gate_completed`

Recommended next Action: Action 600 - Complete Read-Only Git Compatibility Baseline Decision.

No deploy is recommended for Action 599. Do not describe the system as runner-ready, compatibility-ready, repository-read-ready, runtime-ready, staging-ready, execution-ready, Avanza-ready, trading-ready, deployment-ready, or production-ready.
