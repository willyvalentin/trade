# Action 585 - Read-Only Git Porcelain Status Planning Checkpoint

## Action

Action 585 planned the pure, fixture-only read-only Git porcelain status observation contract. This was documentation, evidence, byte-format, parser-policy, and approval-gate work only.

## Approved Baseline

- Workspace: `/Users/willysimonsson/Dev/trade-action-534`.
- Branch: `codex/action-534-live-resolver`.
- HEAD checkpoint: `ee3ca6d Add reviewed pure read-only Git observation contracts`.
- Initial worktree: clean.
- Action 584 decision: `post_trade_pure_read_only_git_simple_observation_contracts_final_security_review_approved`.

## Files Created

- `docs/read-only-git-porcelain-status-contract-action-585.md`;
- `docs/read-only-git-porcelain-status-architecture-action-585.md`;
- `docs/read-only-git-porcelain-status-action-585-checkpoint.md`.

## Files Modified

- `docs/ture-agent-dev-chat-3-continuation-summary.md`.

No production TypeScript or JavaScript file was modified.

## Command Contract

Only planned argv:

```json
["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]
```

Planned capability:

`git_porcelain_status_v1`

Planned purpose:

`git_porcelain_status`

No omitted flags, reordered flags, pathspecs, caller config, alternate ignored-file mode, rename mode, submodule mode, porcelain v2, human-readable output, or arbitrary status flags are approved.

## Architecture Decision

Selected Option B:

Action 586 - Implement Pure Byte-Oriented Porcelain Status Completion Input Contract.

The status parser itself remains unimplemented and requires a later separately reviewed Action.

## Byte Representation

Selected completion-input representation:

- `stdoutBytesHex`: lowercase even-length hex;
- `stdoutByteCount`: exact byte length;
- `stderrBytesHex`: empty;
- `stderrByteCount`: 0.

This preserves invalid UTF-8 and NUL-framed bytes without replacement decoding.

## Grammar And Semantics

Planned parser grammar:

- empty bytes mean clean;
- non-empty records are `X Y SP PATH NUL`;
- untracked is `??`;
- unmerged is one of `DD`, `AU`, `UD`, `UA`, `DU`, `AA`, `UU`;
- rename/copy `R`/`C` reject under `--no-renames`;
- ignored `!!` rejects because `--ignored` is absent;
- no record requiring a second pathname is accepted.

Status summary:

- staged count from X;
- unstaged count from Y;
- untracked count from `??`;
- unmerged count from unmerged pairs;
- ignored count remains zero;
- submodule-specific count is not trustworthy in porcelain v1 `-z` and remains zero or separately reviewed later.

## Limits

Planned limits:

- raw stdout: 65536 bytes;
- record count: 2048;
- per-path bytes: 4096;
- cumulative path bytes: 65536;
- stderr: 0 bytes.

No truncation, repair, fallback, or count-only accepted result is allowed.

## Privacy

The parser may inspect exact path bytes but final accepted evidence should retain path byte fingerprints, lengths, ordered record fingerprints, aggregate path-list fingerprint, counts, and breakdowns. It should not retain plaintext path bytes.

## Validation

Validation completed:

- `./node_modules/.bin/tsc --noEmit`: passed;
- simple-observation, Apple parser, generic parser, Git-version orchestrator, neutralization, and raw-completion group: 263 passed;
- direct-spawn, revalidation, dormant composition, pure composition, resolver/security, and Action 533 group: 1124 passed;
- broad dormant/process/credential/CLI/authorization suites: 871 passed;
- scoped ESLint: not applicable unless final TS/JS changes are introduced;
- `git diff --check`: passed;
- static production-source diff review: passed, no production TS/JS file changed;
- static export-surface review: passed, docs-only diff;
- static runtime-reachability review: passed for Action 585 changes. Pre-existing dormant migration-preflight porcelain-status references remain unmodified and do not implement the exact planned `-z` tuple;
- static prohibited-operation review: passed, docs-only non-authorization references only;
- migration-suite baseline limitation check: passed as unrelated baseline limitation; `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` remains absent;
- quiet `.env.local` diff guard: passed;
- `find docs -type f -size 0`: passed.

## Non-Authorizations

Action 585 does not authorize Git repository inspection, process creation or observation, repository-read authority, porcelain-status parser implementation, runner implementation, compatibility decisions, runtime/API/UI/runner activation, credentials, environment or network access, Avanza/trading behavior, persistence, deployment, commit, push, merge, or deploy. Pre-existing dormant migration-preflight porcelain-status references remain unmodified and are not an Action 585 activation path.

## Decision

`post_trade_read_only_git_porcelain_status_observation_contract_plan_ready`

## Result Status

`post_trade_read_only_git_porcelain_status_action_585_planning_gate_completed`

## Recommended Next Action

Action 586 - Implement Pure Byte-Oriented Porcelain Status Completion Input Contract.
