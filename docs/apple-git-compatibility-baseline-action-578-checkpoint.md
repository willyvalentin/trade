# Action 578 Checkpoint - Apple Git Compatibility Baseline

## Action

Action 578 resumed Git compatibility baseline derivation using the approved pure Apple Git interpretation evidence.

This was documentation, evidence, policy-baseline, and approval-gate work only.

## Files Created

- `docs/apple-git-compatibility-baseline-action-578.md`
- `docs/apple-git-compatibility-policy-options-action-578.md`
- `docs/apple-git-compatibility-baseline-action-578-checkpoint.md`

## Files Modified

- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Approved Baseline

- Action 577 checkpoint commit: `8aafdf2 Add reviewed pure Apple Git version parser`
- Workspace: `/Users/willysimonsson/Dev/trade-action-534`
- Branch: `codex/action-534-live-resolver`
- Initial worktree: clean

## Current Evidence

- canonical executable: `/usr/bin/git`
- platform scope: reviewed macOS / Apple Command Line Tools environment
- observed output: `git version 2.39.5 (Apple Git-154)`
- upstream parsed version: `2.39.5`
- Apple vendor identity: `Apple Git`
- Apple build: `154`
- CLT package receipt: `com.apple.pkg.CLTools_Executables`
- CLT package version: `16.4.0.0.1.1747106510`
- generic parser: strict and unchanged
- Apple parser: pure, fixture-only, reviewed, non-authoritative

## Compatibility Dimensions

- Output-grammar compatibility: resolved for the reviewed Apple parser grammar.
- Command-capability compatibility: unresolved for future activation.
- Apple-packaging compatibility: retained as evidence, not selected as a policy floor.
- Security compatibility: unresolved for future repository inspection.
- Runtime/deployment readiness: out of scope and unauthorized.

## Dormant Chain Requirements

The current dormant chain requires only exact `/usr/bin/git`, exact `["--version"]`, ordinary zero-exit completion, empty stderr, bounded valid UTF-8 stdout, exact Apple output grammar, and successful pure Apple interpretation.

A numeric baseline for only this dormant chain would be tautological, so none is derived.

## Future Activation Requirements

Future Git repository inspection commands remain structurally present in the dormant runner catalog but are not yet approved as the exact activation capability contract for this policy:

- `git rev-parse --show-toplevel`
- `git rev-parse HEAD`
- `git branch --show-current --no-color`
- `git status --porcelain=v1 --untracked-files=all --no-renames`
- `git diff --cached --name-status --no-ext-diff`
- `git diff --name-status --no-ext-diff`
- `git ls-files --others --exclude-standard`

## Policy Decision

Selected option:

`OPTION 2 - ACTIVATION CAPABILITY CONTRACT REQUIRED`

Decision: `post_trade_apple_git_compatibility_policy_baseline_unresolved_pending_read_only_activation_capability_contract`

Result status: `post_trade_git_compatibility_baseline_action_578_completed_unresolved`

Recommended next Action: Action 579 - Define Exact Read-Only Git Activation Capability Contract.

## Validation

Validation is recorded in the final Action 578 response.

## Non-Authorizations

No compatibility evaluator, production compatibility-policy module, parser change, orchestrator change, neutralization/raw/direct-spawn/resolver/composition/revalidation change, production Git execution path, runtime/API/UI/runner wiring, credential/environment/network access, Avanza/trading behavior, persistence, deployment, commit, push, merge, or deploy occurred.

## Commit / Deploy

No deploy is recommended for Action 578. No commit, push, merge, or deploy occurred.
