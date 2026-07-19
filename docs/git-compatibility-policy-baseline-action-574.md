# Action 574 - Git Compatibility Policy Baseline

## Baseline Status

Baseline resolution status:

`unresolved_platform_output_prerequisite`

No supported major set, per-major minimum, maximum version, or final effective minimum is selected in Action 574.

## Baseline Artifact Design

The future source-controlled baseline record should include:

| Field | Planned value |
| --- | --- |
| baseline kind | `pure_git_compatibility_policy_baseline` |
| baseline id | `ture.execution.git-compatibility-baseline.first-live-read-only-staging-preflight.v1` |
| baseline version | `1` |
| platform scope | `macos` only unless separately reviewed |
| executable | `/usr/bin/git` unless platform/output prerequisite revises this |
| command | `git --version` for current dormant chain |
| parser contract | `ture.execution.pure-git-version-interpretation-contract.fixture.v1` |
| parser grammar | `ture.execution.git-version-grammar.strict-three-component-ascii.v1` |
| feature minimum | `null` until platform/output prerequisite is resolved |
| security minimum | `null` until activation repository-inspection contract exists |
| platform minimum | `null` until Apple `/usr/bin/git` output posture is resolved |
| supported major set | `null` |
| per-major minimum | `null` |
| future-major posture | `reject_until_reviewed` |
| resolution status | `unresolved_platform_output_prerequisite` |
| authority | `none` |
| runtimeActivated | `false` |
| compatibilityAuthorityGranted | `false` |
| stagingReadinessGranted | `false` |
| deploymentAuthorityGranted | `false` |
| toctouEliminated | `false` |

## Required Capability List

Current dormant production chain:

1. exact `/usr/bin/git` executable identity already resolved by the live resolver/revalidation path;
2. exact argv `["--version"]`;
3. ordinary zero-exit completion with empty stderr and bounded stdout;
4. strict parser acceptance of `git version <major>.<minor>.<patch>` with optional one final LF.

Future activation candidate list, not yet baseline-authoritative:

1. `git rev-parse --show-toplevel`;
2. `git rev-parse HEAD`;
3. `git branch --show-current --no-color`;
4. `git status --porcelain=v1 --untracked-files=all --no-renames`;
5. `git diff --cached --name-status --no-ext-diff`;
6. `git diff --name-status --no-ext-diff`;
7. `git ls-files --others --exclude-standard`.

## Excluded Capability List

The compatibility baseline must not imply:

- `git add`;
- `git commit`;
- `git push`;
- `git fetch`;
- `git checkout`;
- `git switch`;
- `git restore`;
- `git clean`;
- `git update-index`;
- shell execution;
- hooks or external helpers;
- credential helper access;
- network access;
- repository mutation;
- deployment authority.

## Policy Shape Re-Evaluation

Action 573 preferred supported major set plus per-major minimum. Action 574 re-evaluates that shape as follows:

| Shape | Action 574 verdict |
| --- | --- |
| Minimum-only | Rejected; accepts unreviewed future majors and hides platform/output issues. |
| Supported major set plus per-major minimum | Still the preferred eventual shape after platform/output resolution. |
| Inclusive min/max | Not selected; no evidence supports a maximum. |
| Exact version allowlist | Not selected; too brittle unless Apple `/usr/bin/git` output remains parser-incompatible and the project chooses exact platform packaging. |
| Unresolved pending prerequisite | Selected for Action 574. |

Final posture for this action:

`unresolved_platform_output_prerequisite`

## Numeric Baseline Derivation

No numeric baseline is derived.

Reasons:

1. Current dormant production chain only requires `git --version`, so repository-inspection commands should not inflate the baseline.
2. The approved parser rejects suffixes, while observed `/usr/bin/git --version` output on the target macOS tool path includes an Apple suffix.
3. Future repository-inspection commands are listed in a dormant runner catalog but are not yet bound to this Git compatibility policy with exact security controls and output parsing requirements.
4. Security posture for processing repository metadata, ignore files, attributes, submodules, object formats, external diff/textconv behavior, and unusual filenames remains undefined for the future activation path.

## Evidence References

- Current dormant direct-spawn Git operation: `lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter-core.ts`.
- Parser strict grammar: `lib/post-trade-pure-git-version-interpretation-contract-core.ts`.
- Orchestrator no-compatibility review: `docs/dormant-server-only-neutralization-to-git-interpretation-action-572-final-re-review.md`.
- Future runner Git catalog: `lib/post-trade-read-only-live-staging-migration-preflight-runner-core.ts`.
- Action 533 operation registry: `docs/execution-agent-cross-boundary-integration-readiness-review.md`.
- Official Git status docs: https://git-scm.com/docs/git-status
- Official Git branch docs: https://git-scm.com/docs/git-branch
- Official Git 2.22.0 release notes for `branch --show-current`: https://code.googlesource.com/git/+/refs/tags/v2.32.3/Documentation/RelNotes/2.22.0.txt
- Official Git diff docs: https://git-scm.com/docs/git-diff
- Official Git ls-files docs: https://git-scm.com/docs/git-ls-files
- Official Git rev-parse docs: https://code.googlesource.com/git/+/HEAD/Documentation/git-rev-parse.adoc

## Required Prerequisite

Recommended next Action:

`Action 575 - Resolve Apple /usr/bin/git Version Output Contract and Parser Eligibility for Git Compatibility Baseline`

That action should decide one of:

1. keep strict upstream-style grammar and require a non-Apple-suffixed approved Git executable;
2. explicitly revise the parser grammar to accept Apple-suffixed `/usr/bin/git` output under a reviewed, bounded, source-controlled normalization policy;
3. change the approved platform/executable target;
4. keep the policy unresolved and block compatibility implementation.

## Non-Authorizations

This baseline artifact grants no process execution authority, process observation authority, repository mutation authority, Git command authority, credential authority, network authority, runtime authority, staging authority, deployment authority, API/UI/runner authority, Avanza/trading authority, or persistence authority.

It also does not authorize implementing the compatibility evaluator.

## Decision

Decision: `post_trade_git_compatibility_policy_baseline_unresolved_platform_output_prerequisite`

Result status: `post_trade_git_capability_inventory_action_574_completed_policy_baseline_unresolved_platform_output`

Recommended next Action: Action 575 - Resolve Apple /usr/bin/git Version Output Contract and Parser Eligibility for Git Compatibility Baseline.
