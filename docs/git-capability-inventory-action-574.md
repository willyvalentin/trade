# Action 574 - Git Capability Inventory

## Approved Baseline Checkpoint

Action 574 starts from the committed and pushed Action 573 checkpoint:

- workspace: `/Users/willysimonsson/Dev/trade-action-534`;
- branch: `codex/action-534-live-resolver`;
- HEAD checkpoint: `2511e0c Add pure Git compatibility policy planning gate`;
- initial worktree status: clean.

Action 573 deliberately left the numeric Git compatibility policy unresolved. It recommended a source-controlled pure policy/evaluator shape, but required this inventory before choosing any Git version baseline.

## Methodology

Repository inspection used read-only source searches over:

- Action 573 planning and architecture docs;
- pure Git-version parser core and tests;
- dormant neutralization-to-Git-interpretation orchestrator core, tests, and Action 568-572 review docs;
- raw-completion, neutralization, direct-spawn, resolver, composition, revalidation, no-credential, authorization, lifecycle, output-retention, and Action 533 contracts;
- package scripts, config files, shell scripts, repository docs, and Git-related utility references.

Search terms included `git --version`, `collect_git_version`, `/usr/bin/git`, `git status`, `git diff`, `git branch`, `git rev-parse`, `git ls-files`, `git log`, `git worktree`, `git fetch`, `git checkout`, `git switch`, `git restore`, `git clean`, `git commit`, `git push`, `--porcelain`, `--porcelain=v2`, `-z`, pathspec, object-format, SHA-1, and SHA-256.

Primary external evidence checked for Git command behavior:

- Git status documentation: https://git-scm.com/docs/git-status
- Git branch documentation: https://git-scm.com/docs/git-branch
- Git 2.22.0 release notes: https://code.googlesource.com/git/+/refs/tags/v2.32.3/Documentation/RelNotes/2.22.0.txt
- Git diff documentation: https://git-scm.com/docs/git-diff
- Git ls-files documentation: https://git-scm.com/docs/git-ls-files
- Git rev-parse documentation: https://code.googlesource.com/git/+/HEAD/Documentation/git-rev-parse.adoc

Repository-local read-only Git observations were limited to precondition/status checks and `/usr/bin/git --version` output shape inspection. They were not used to select a version baseline.

## Current Dormant-Chain Capabilities

Category A: required by current approved dormant production chain.

| Capability | Exact source | Command / behavior | Production relevance | Baseline impact |
| --- | --- | --- | --- | --- |
| Resolve exact Git executable | resolver/revalidation/direct-spawn/parser contracts | `/usr/bin/git` | Current dormant chain fixes the Git executable identity and path. | Platform/output prerequisite remains open. |
| Collect Git version | direct-spawn policy | `["--version"]` | Current dormant chain's only Git invocation shape. | Feature requirement is very small, but output grammar matters. |
| Ordinary completion | raw-completion and orchestrator contracts | zero exit, empty stderr, bounded stdout | Required before parsing. | No repository operation required. |
| Parse strict version output | pure Git parser | `git version <major>.<minor>.<patch>` with optional one final LF | Parser accepts grammar only. | Apple suffix currently conflicts with strict parser grammar. |

The current approved dormant production chain does not require repository root detection, branch inspection, HEAD inspection, status parsing, diff parsing, tracked-file inventory, fetch, checkout, switch, restore, clean, commit, push, worktree management, object parsing, remote access, credentials, or mutation.

Therefore current dormant-chain compatibility may require only `git --version`, but the approved `/usr/bin/git` platform/output posture is not yet resolved.

## Development And Review Workflow Capabilities

Category B: required by current development or review workflow, not production policy.

| Capability | Examples found | Purpose | Compatibility-policy relevance |
| --- | --- | --- | --- |
| Branch and HEAD inspection | `git branch --show-current`, `git log --oneline`, `git log -1 --oneline` | Action preconditions and checkpoint confirmation. | Development-only unless future runtime contract adopts it. |
| Clean-worktree inspection | `git status --short --branch`, `git status --porcelain=v1 --untracked-files=all` | Human/Codex safety gates. | Development-only today. |
| Diff hygiene | `git diff --check`, `git diff -- .env.local --exit-code --quiet` | Validation and env guard. | Development-only today. |
| Commit/push checkpointing | `git add`, `git commit`, `git push` | Source-control checkpoint management. | Out of scope for compatibility policy. |
| Worktree management | `git worktree` references in instructions/docs | Isolated development workflow. | Development-only unless separately reviewed. |
| Historical scripts | `scripts/action-*.mjs` with `git status --porcelain=v1` | Prior release/preview tooling checks. | Not inherited by the first-live Git compatibility policy. |

Development workflow usage must not raise the production compatibility baseline by itself.

## Future Activation Capability Inventory

Category C: required by an approved future activation plan or source-controlled dormant runner contract.

The existing read-only staging migration preflight runner catalog includes read-only Git repository checks:

| Capability | Current command spec | Source | Classification | Notes |
| --- | --- | --- | --- | --- |
| Repository root | `git rev-parse --show-toplevel` | `lib/post-trade-read-only-live-staging-migration-preflight-runner-core.ts` | C | Future runner/repository verification. |
| Current commit | `git rev-parse HEAD` | same | C | Future runner/repository verification. |
| Current branch | `git branch --show-current --no-color` | same | C | Future runner/repository verification. |
| Porcelain status | `git status --porcelain=v1 --untracked-files=all --no-renames` | same | C | Future clean-worktree verification. |
| Staged files | `git diff --cached --name-status --no-ext-diff` | same | C | Future review/migration safety evidence. |
| Unstaged files | `git diff --name-status --no-ext-diff` | same | C | Future review/migration safety evidence. |
| Untracked files | `git ls-files --others --exclude-standard` | same | C | Future review/migration safety evidence. |

These are not required by the current dormant neutralization-to-Git-interpretation chain. They are future activation inputs and must be governed by a separate activation capability contract before they can justify a Git compatibility baseline.

Category D: hypothetical or convenience only.

- `git symbolic-ref`, `git show-ref`, `git merge-base`, `git cat-file`, `git check-ignore`, `git config`, pathspec magic, object-format detection, and SHA-1/SHA-256 repository feature handling were searched but are not required by the current dormant chain.
- They may become relevant only if a future reviewed activation contract explicitly adopts them.

Category E: prohibited or out of scope.

- Mutating commands: `git add`, `git commit`, `git checkout`, `git switch`, `git restore`, `git clean`, `git update-index`.
- Remote/credential commands: `git fetch`, `git push`.
- Any command that can invoke hooks, external helpers, credential helpers, network access, checkout mutation, index mutation, or repository mutation.

## Feature-Version Evidence

| Capability | Evidence | Earliest evidence quality | Action 574 conclusion |
| --- | --- | --- | --- |
| `git --version` | Git docs direct users to check version with `git --version`. | Stable, but no exact introduction version was established from local primary release notes. | Sufficient for recognizing the command shape, insufficient alone for numeric policy. |
| Strict `git version x.y.z` grammar | Parser contract and tests define strict grammar. | Source-controlled contract evidence. | Current parser grammar is authoritative for parsing, not compatibility. |
| `git branch --show-current` | Git 2.22.0 release notes state the option was learned in 2.22.0. | Strong primary release-note evidence. | If adopted into runtime activation, feature floor is at least 2.22.0. |
| `git status --porcelain=v1` | Git status docs describe v1 as stable across Git versions and user config. | Strong docs evidence for format stability. | Required only for future runner path, not current dormant chain. |
| `git status --no-renames` | Current Git status docs document `--renames` / `--no-renames`. | Current docs evidence, but exact introduction version not established. | Requires activation contract and version research before numeric baseline. |
| `git diff --name-status --no-ext-diff` | Git diff docs document `--name-status` and `--no-ext-diff`. | Strong current docs evidence. | Required only for future runner path. |
| `git ls-files --others --exclude-standard` | Git ls-files docs document both flags. | Strong current docs evidence. | Required only for future runner path. |
| `git rev-parse --show-toplevel` and `HEAD` | Git rev-parse docs document repository top-level and revision parsing. | Strong current docs evidence. | Required only for future runner path. |

Because the current chain only needs `git --version`, while the future runner capabilities require additional commands and flags whose activation semantics are not yet re-approved for this chain, Action 574 does not derive a numeric baseline.

## Security Baseline Review

For the current dormant production chain, `git --version` does not inspect repository contents, hooks, attributes, submodules, alternates, object databases, remote URLs, or credential helpers. Feature availability is the dominant requirement.

For the future repository-inspection path, security posture changes:

- `git status` and `git ls-files` may read ignore patterns, repository metadata, index state, submodule state, and worktree paths;
- `git diff` can be influenced by attributes and external diff/textconv settings unless controlled by options such as `--no-ext-diff` and parser policy;
- repository inspection may process untrusted filenames and unusual path encodings;
- branch and HEAD checks depend on repository state and detached-head behavior;
- object-format and SHA-1/SHA-256 assumptions remain undefined in the future runner contract.

No Git security minimum is selected in Action 574 because no reviewed activation contract yet states whether repository data is trusted, which repository features are allowed, which config sources are disabled, and which Git commands are actually authorized.

## Platform Posture

The approved contracts currently target:

- platform: `macos`;
- executable: `/usr/bin/git`;
- argv: `["--version"]`.

Repository-local observation:

- `/usr/bin/git --version` returned an Apple-suffixed output shape: `git version 2.39.5 (Apple Git-154)`.

The pure parser currently rejects suffixes and accepts only strict three-component output with optional final LF. This creates a platform/output prerequisite: before compatibility policy implementation, the project must decide whether the approved target is upstream-style Git output only, Apple `/usr/bin/git` suffix output, or a revised executable/platform policy.

Action 574 does not broaden the platform beyond macOS and does not generalize to arbitrary Unix-like systems.

## Classification Summary

| Category | Result |
| --- | --- |
| A. Current dormant production chain | Only `/usr/bin/git --version`, ordinary zero-exit completion, strict parser grammar, no repository operation. |
| B. Development/review workflow | Many Git commands for preconditions, clean-worktree checks, diffs, commits, pushes, and worktrees; not production policy. |
| C. Approved future activation plan | Runner catalog lists read-only repo inspection commands, but activation contract is not exact enough to set a compatibility baseline for this chain. |
| D. Hypothetical/convenience | Symbolic refs, show-ref, merge-base, cat-file, check-ignore, config, pathspec magic, object-format handling unless future contract adopts them. |
| E. Prohibited/out of scope | Mutating commands, remote commands, credentialed commands, checkout/clean/update-index, hooks/helpers/network/credential behavior. |

## Conclusion

Action 574 cannot honestly derive a single numeric Git compatibility baseline.

The blocking reason is not absence of Git in the current chain. The current chain's capability is tiny. The blocker is that the approved macOS `/usr/bin/git` target can emit Apple-suffixed version output that the strict parser rejects, and the future repository-inspection activation command set has not been reduced into an exact compatibility contract with security posture, output formats, config controls, and minimum-version evidence.

Decision option selected: Option 3 - platform/output prerequisite required.

Recommended next Action:

`Action 575 - Resolve Apple /usr/bin/git Version Output Contract and Parser Eligibility for Git Compatibility Baseline`

No compatibility implementation should begin until that platform/output decision is source-controlled and reviewed.
