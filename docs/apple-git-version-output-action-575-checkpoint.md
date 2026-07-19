# Action 575 Checkpoint - Apple Git Version Output Contract

## Action

Action 575 resolved the platform/output prerequisite identified by Action 574 by choosing a separate pure Apple Git version interpretation contract as the next step.

This was documentation, evidence, parser-policy planning, and approval-gate work only.

## Files Created

- `docs/apple-git-version-output-contract-action-575.md`
- `docs/apple-git-parser-eligibility-options-action-575.md`
- `docs/apple-git-version-output-action-575-checkpoint.md`

## Files Modified

- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Approved Baseline

- Action 574 checkpoint commit: `59e7fec Add Git capability inventory and compatibility baseline`
- Workspace: `/Users/willysimonsson/Dev/trade-action-534`
- Branch: `codex/action-534-live-resolver`
- Initial worktree: clean

## Evidence Commands

- `/usr/bin/git --version`: `git version 2.39.5 (Apple Git-154)`
- `/usr/bin/xcode-select -p`: `/Library/Developer/CommandLineTools`
- `stat -f ... /usr/bin/git`: regular file, 118864 bytes, executable mode.
- `file /usr/bin/git`: Mach-O universal binary with x86_64 and arm64e architectures.
- `codesign -dv /usr/bin/git`: identifier `com.apple.dt.xcode_select.tool-shim`.
- `pkgutil --file-info /usr/bin/git`: path recorded under `/usr/bin/git`.
- `pkgutil --pkg-info=com.apple.pkg.CLTools_Executables`: package `com.apple.pkg.CLTools_Executables`, version `16.4.0.0.1.1747106510`.
- `printf ... | wc -c`: evidenced output with final LF is 35 bytes.

## Primary-Source Findings

- Apple documents Command Line Tools installation under `/Library/Developer/CommandLineTools`.
- Apple documents `xcode-select --print-path` for the active developer directory.
- Apple documents `pkgutil --pkg-info=com.apple.pkg.CLTools_Executables` for checking Command Line Tools package version.
- Apple TN2339 states macOS includes shims or wrapper executables.
- Apple public docs reviewed do not define a stable `Apple Git-N` suffix grammar.
- Git docs state `git --version` is equivalent to `git version` and prints the Git suite version.

## Parser Incompatibility

The current parser accepts only `git version <major>.<minor>.<patch>` plus optional final LF and rejects suffixes/vendor metadata. The observed Apple output has a parenthetical vendor/build suffix and therefore currently triggers `suffix_rejected` and `version_grammar_rejected`.

No parser code changed.

## Chosen Option

Chosen option: separate pure Apple Git version interpretation contract.

Rejected:

- keeping Apple output permanently ineligible as too blocking for the reviewed macOS `/usr/bin/git` target;
- parser v2 in the generic parser as too coupled at this stage;
- changing canonical executable as premature;
- silent suffix stripping as unsafe.

## Future Grammar

Future grammar should accept only:

`git version M.m.p (Apple Git-B)`

with exact punctuation, exact case-sensitive `Apple Git` label, one numeric Apple build component, optional one final LF, empty stderr, no extra text, no localization, no ANSI/control/NUL/CR, and no broad trim or normalization.

## Compatibility Impact

Compatibility baseline remains unresolved. Future policy likely needs both upstream Git version and Apple package/build/provenance posture. Parser acceptance does not imply compatibility.

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
- Static runtime-reachability review: passed; no app/lib/test Apple parser implementation path exists.
- Static prohibited-operation review: passed by docs-only diff and no changed production TS/JS files.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.

Playwright emitted existing `[DEP0205] module.register()` and `NO_COLOR`/`FORCE_COLOR` warnings; these were not failures.

## Decision

Decision: `post_trade_apple_git_version_output_contract_resolved_separate_parser_required`

Result status: `post_trade_apple_git_version_output_action_575_completed_separate_parser_planned`

Recommended next Action: Action 576 - Implement Pure Apple Git Version Interpretation Contract.

## Commit / Deploy

No deploy is recommended for Action 575. No commit, push, merge, or deploy occurred.
