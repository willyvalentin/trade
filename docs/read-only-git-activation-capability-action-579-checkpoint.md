# Action 579 Checkpoint - Read-Only Git Activation Capability Contract

## Summary

Action 579 defined the smallest exact read-only Git activation capability contract required before a future separately reviewed repository-inspection boundary may be planned. This was documentation, architecture, capability-definition, and approval-gate work only.

No Git runner, repository inspection, compatibility evaluator, production compatibility-policy module, parser change, orchestrator change, neutralizer change, raw-completion change, direct-spawn change, resolver change, composition change, revalidation change, runtime/API/UI/runner wiring, credential access, environment access, network access, Avanza/trading behavior, persistence, deployment, commit, push, merge, or deploy occurred.

## Baseline

- Workspace: `/Users/willysimonsson/Dev/trade-action-534`.
- Branch: `codex/action-534-live-resolver`.
- Required checkpoint: `0a1b23d Add Apple Git compatibility baseline assessment`.
- Initial status: clean.
- Action 578 decision: `post_trade_apple_git_compatibility_policy_baseline_unresolved_pending_read_only_activation_capability_contract`.

## Files Created

- `docs/read-only-git-activation-capability-contract-action-579.md`
- `docs/read-only-git-capability-architecture-action-579.md`
- `docs/read-only-git-activation-capability-action-579-checkpoint.md`

## Files Modified

- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Selected Observation Set

Selected a narrowed Option C: identity, cleanliness, object-format posture, and bounded operation-state handling.

Required initial observations:

- repository root identity;
- current branch or detached state;
- HEAD object identity;
- object format;
- staged, unstaged, and untracked cleanliness;
- unmerged/conflict state from status output;
- worktree identity through provenance, not caller cwd.

Complete clean rebase/cherry-pick/revert/bisect control-path detection remains a future separately reviewed capability if required.

## Exact Approved Capability Tuples

Future initial capability contract:

- `git_repository_root_v1`: `["rev-parse", "--show-toplevel"]`;
- `git_object_format_v1`: `["rev-parse", "--show-object-format"]`;
- `git_head_object_v1`: `["rev-parse", "--verify", "HEAD"]`;
- `git_branch_state_v1`: `["symbolic-ref", "--quiet", "--short", "HEAD"]`;
- `git_cleanliness_status_v1`: `["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]`.

No caller-supplied command, flag, revision, pathspec, cwd, environment, timeout, output limit, parser option, or compatibility rule is approved.

## Posture

- Working directory: provenance-linked approved worktree capability only.
- Environment: fixed minimal non-secret environment; no inherited environment.
- Config: influence unresolved pending output-contract and config-isolation review.
- External programs: no hooks, filters, pagers, credential helpers, remote helpers, shell, editors, signing programs, merge tools, checkout filters, or LFS filters.
- Network/credentials: prohibited.
- Mutation: prohibited.
- Object format: require `sha1` or `sha256` evidence before HEAD parsing.
- Path safety: prefer NUL-delimited status and minimal retention.
- TOCTOU: not eliminated; revalidation and expiry required.
- Authority: `none`.

## Compatibility Impact

The exact command set is now defined, but Action 579 recommends planning pure output contracts before numeric Apple Git compatibility-baseline derivation.

Remaining prerequisites:

- pure output contracts for root, object format, HEAD, branch, and status;
- fixed environment map;
- config influence policy;
- active-operation detection decision;
- feature-version evidence for selected commands and flags.

## Recommended Next Action

Action 580 - Plan Pure Read-Only Git Observation Output Contracts.

## Decision

Decision: `post_trade_read_only_git_activation_capability_contract_defined`

Result status: `post_trade_read_only_git_activation_capability_action_579_completed`

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- Apple parser suite: passed, 64 tests.
- Generic Git parser suite: passed, 62 tests.
- Orchestrator suite: passed, 20 tests.
- Neutralization suite: passed, 15 tests.
- Raw completion suite: passed, 49 tests.
- Direct-spawn suite: passed, 19 tests.
- Revalidation suite: passed, 30 tests.
- Dormant composition suite: passed, 17 tests.
- Pure composition suite: passed, 13 tests.
- Resolver/security suites: passed, 491 tests.
- Action 533 suite: passed, 181 tests.
- Broad dormant/process/credential/CLI/authorization group: passed, 871 tests.
- Scoped ESLint on changed TS/JS files: not applicable; no TS/JS files changed.
- `git diff --check`: passed.
- Static production-source diff review: passed; no `lib`, `app`, `components`, or `tests` files changed.
- Static export-surface review: passed; Action 579 identifiers are not reachable from `lib`, `app`, `components`, or `tests`.
- Static runtime-reachability review: passed; no runtime/API/UI/runner caller was added.
- Static prohibited-operation review: passed; hits were docs-only non-authorization prose.
- Migration-suite baseline limitation check: blocked by the pre-existing missing migration file `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.

## Commit / Deploy

No deploy is recommended for Action 579. No commit, push, merge, or deploy occurred.
