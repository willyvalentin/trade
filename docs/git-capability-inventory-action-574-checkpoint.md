# Action 574 Checkpoint - Git Capability Inventory And Compatibility Baseline

## Action

Action 574 inventoried required Git capabilities and assessed whether a numeric Git compatibility policy baseline can be justified.

This was documentation, repository-inventory, and policy-baseline work only.

## Files Created

- `docs/git-capability-inventory-action-574.md`
- `docs/git-compatibility-policy-baseline-action-574.md`
- `docs/git-capability-inventory-action-574-checkpoint.md`

## Files Modified

- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Approved Baseline

- Action 573 checkpoint commit: `2511e0c Add pure Git compatibility policy planning gate`
- Workspace: `/Users/willysimonsson/Dev/trade-action-534`
- Branch: `codex/action-534-live-resolver`
- Initial worktree: clean

## Inventory Methodology

Inspected Action 573 docs, parser/orchestrator/raw/neutralization/direct-spawn/revalidation/composition/resolver/authorization/no-credential/lifecycle/Action 533 contracts, package scripts, config, docs, scripts, and Git-related tests.

Searched for required Git commands and flags including version, status, diff, branch, rev-parse, ls-files, worktree, mutating commands, porcelain formats, null output, pathspec, and object-format references.

Checked official Git documentation and release notes for command behavior evidence.

## Classification Results

- A. Current dormant production chain: `/usr/bin/git --version`, ordinary zero-exit completion, empty stderr, bounded stdout, strict parser grammar only.
- B. Development/review workflow: branch/status/log/diff/add/commit/push/worktree commands used for human/Codex/CI validation and checkpointing; not production policy.
- C. Approved future activation plan: dormant runner catalog lists read-only repository inspection commands, including `rev-parse`, `branch --show-current`, `status --porcelain=v1`, `diff --name-status`, and `ls-files --others`.
- D. Hypothetical/convenience: symbolic-ref, show-ref, merge-base, cat-file, check-ignore, config, pathspec magic, object-format handling unless future contracts adopt them.
- E. Prohibited/out of scope: mutating, remote, credentialed, checkout/clean/update-index, hook/helper/network/deployment behavior.

## Feature-Version Evidence

- `branch --show-current` has strong primary release-note evidence in Git 2.22.0.
- `status --porcelain=v1`, `diff --name-status --no-ext-diff`, `ls-files --others --exclude-standard`, and `rev-parse --show-toplevel` have official documentation evidence.
- Exact introduction versions for every future runner flag were not fully established.
- No exact feature or security minimum is justified for the current dormant chain beyond `git --version` output compatibility.

## Security Findings

- Current dormant `git --version` does not inspect repository contents.
- Future repository inspection may process config-influenced metadata, ignore files, attributes, submodules, object-format assumptions, external diff/textconv policy, and unusual filenames.
- No security minimum was selected because the activation contract is not exact enough.

## Platform Posture

- Current approved platform: macOS.
- Current approved executable: `/usr/bin/git`.
- Current observed `/usr/bin/git --version` output includes an Apple suffix.
- Current parser rejects suffixes.

This creates a platform/output prerequisite before a numeric compatibility baseline can be implemented.

## Policy-Shape Conclusion

Action 573's supported-major/per-major-minimum shape remains the likely eventual shape, but Action 574 selects unresolved platform/output prerequisite for the current decision.

## Numeric Baseline

No numeric baseline was derived.

Rationale:

- current dormant production chain requires only `git --version`;
- current parser grammar and macOS `/usr/bin/git` output posture conflict;
- future repository-inspection operations remain activation-contract inputs, not current compatibility-policy requirements;
- security and platform requirements for future repository inspection remain undefined.

## Decision Option

Selected: Option 3 - platform/output prerequisite required.

Decision: `post_trade_git_compatibility_policy_baseline_unresolved_platform_output_prerequisite`

Result status: `post_trade_git_capability_inventory_action_574_completed_policy_baseline_unresolved_platform_output`

Recommended next Action: Action 575 - Resolve Apple /usr/bin/git Version Output Contract and Parser Eligibility for Git Compatibility Baseline.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- Orchestrator suite: passed, 20 tests.
- Neutralization suite: passed, 15 tests.
- Git parser suite: passed, 62 tests.
- Raw completion suite: passed, 49 tests.
- Direct-spawn suite: passed, 19 tests.
- Revalidation suite: passed, 30 tests.
- Dormant composition suite: passed, 17 tests.
- Pure composition suite: passed, 13 tests.
- Resolver/security group: passed, 515 tests.
- Action 533 cross-boundary suite: passed, 181 tests.
- Broad dormant/process/credential/CLI/authorization group: passed, 1068 tests.
- Scoped ESLint on changed TS/JS files: not applicable; no TypeScript or JavaScript files changed.
- `git diff --check`: passed.
- Static production-source diff review: passed; no production TS/JS files changed.
- Static export-surface review: passed; docs-only diff.
- Static runtime-reachability review: passed; no app/lib/test compatibility-policy implementation path exists.
- Static prohibited-operation review: passed by docs-only diff and no changed production TS/JS files.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.

Playwright emitted existing `[DEP0205] module.register()` and `NO_COLOR`/`FORCE_COLOR` warnings; these were not failures.

## Non-Authorizations

No compatibility evaluator, policy module, parser change, orchestrator change, neutralization/raw/direct-spawn/resolver/composition/revalidation change, production Git execution path, runtime/API/UI/runner wiring, credential/environment/network access, Avanza/trading behavior, persistence, deployment, commit, push, merge, or deploy occurred.
