# Action 579 - Read-Only Git Activation Capability Contract

## Approved Action 578 Baseline

Action 579 starts from the committed Action 578 checkpoint:

- workspace: `/Users/willysimonsson/Dev/trade-action-534`;
- branch: `codex/action-534-live-resolver`;
- HEAD checkpoint: `0a1b23d Add Apple Git compatibility baseline assessment`;
- initial worktree status: clean.

Action 578 left Apple Git compatibility unresolved pending an exact read-only activation capability contract. Action 579 defines that contract as documentation and architecture only. It does not implement a Git runner, repository inspection, compatibility evaluator, production policy module, parser change, orchestrator change, neutralizer change, raw-completion change, direct-spawn change, resolver change, composition change, revalidation change, runtime caller, API/UI/runner wiring, credential access, environment access, network access, Avanza/trading behavior, persistence, deployment, commit, push, or merge.

## Repository Search Methodology

Repository inspection used source searches for the requested command assumptions, including `git rev-parse`, `git symbolic-ref`, `git branch --show-current`, `git status`, `git status --porcelain`, `git diff`, `git ls-files`, `git show-ref`, `git merge-base`, `git cat-file`, `git check-ignore`, `git config`, `git worktree`, `git log`, `git describe`, `git remote`, `git fetch`, `git add`, `git commit`, `git push`, `git checkout`, `git switch`, `git restore`, `git clean`, `git reset`, `git update-index`, `git submodule`, and `git sparse-checkout`.

Reviewed production-relevant sources:

- `lib/post-trade-read-only-live-staging-migration-preflight-runner-core.ts`;
- first-live resolver, composition, revalidation, direct-spawn, neutralization, raw-completion, Git interpretation, Apple Git interpretation, no-credential, no-network, lifecycle, authorization, and Action 533 contracts;
- Action 573-578 docs and checkpoints;
- package scripts and review/validation scripts.

Development commands in scripts, docs, and instructions remain development-only. Documentation examples and Codex validation commands are not approved production capabilities.

Primary Git references reviewed for command semantics:

- Git status documentation: https://git-scm.com/docs/git-status
- Git symbolic-ref documentation: https://git-scm.com/docs/git-symbolic-ref
- Git branch documentation: https://git-scm.com/docs/git-branch
- Git rev-parse documentation: https://git-scm.com/docs/git-rev-parse
- Git diff documentation: https://git-scm.com/docs/git-diff
- Git ls-files documentation: https://git-scm.com/docs/git-ls-files
- Git 2.22.0 release notes for `branch --show-current`: https://code.googlesource.com/git/+/refs/tags/v2.32.3/Documentation/RelNotes/2.22.0.txt

## Current Approved Dormant Chain

Current approved chain:

```text
original production-valid direct-spawn result
  -> one-shot neutralization
  -> approved raw-completion evidence
  -> approved generic or Apple Git-version interpretation
  -> dormant non-authoritative orchestration evidence
```

Only `/usr/bin/git --version` is currently implemented in the dormant product chain. No repository-inspection runner exists, no repository command has runtime approval, no compatibility policy exists, no activation caller exists, and no staging or deployment authority exists.

The approved pure evidence posture remains:

- `observedLiveProcess:false`;
- `authority:none`;
- `toctouEliminated:false`;
- `runtimeActivated:false`;
- no compatibility authority;
- no repository-read authority.

## Capability Classification

| Candidate | Category | Rationale |
| --- | --- | --- |
| Exact Git executable `/usr/bin/git` | A - required | Already the reviewed macOS tool identity for the first-live chain. |
| Git version `["--version"]` | A - required | Required before compatibility evaluation; already covered by the version parser chain. |
| Repository root identity | A - required | Needed to bind observations to the expected source-controlled worktree. |
| Current branch or detached state | A - required | Needed to ensure later activation is operating on an approved branch posture or explicitly blocked detached state. |
| HEAD object identity | A - required | Needed to bind the inspected source state to an exact commit object. |
| Git object format | A - required | Needed before interpreting HEAD length; avoids assuming SHA-1 without evidence. |
| Staged, unstaged, and untracked cleanliness | A - required | Needed for initial read-only activation eligibility. |
| Unmerged/conflict state from status | A - required | Needed to block conflicted or merge-machinery ambiguity. |
| Full rebase/cherry-pick/revert/bisect control-path detection | C - future separately reviewed capability | Git status can show unmerged states, but complete clean-in-progress operation detection likely requires a separate filesystem control-state boundary. |
| `git diff --name-status` and `git ls-files --others` | B - optional diagnostic | Previously cataloged, but redundant for initial eligibility if porcelain status is adopted. |
| Tracked-file inventory, ignored-file inventory, remotes, config, refs, object database inspection | C - future separately reviewed | Broader than the first eligibility contract. |
| Developer `git status`, `git diff --check`, `git log`, commit/push/worktree commands | D - development-only | Used by Codex/developers/CI/checkpoints, not product authority. |
| Fetch, pull, push, clone, checkout, switch, restore, clean, reset, add, commit, update-index, submodule update, sparse-checkout | E - prohibited | Mutating, networked, credentialed, or too broad for the first read-only contract. |

## Minimum Observation-Set Comparison

| Option | Contents | Verdict |
| --- | --- | --- |
| A - minimal identity only | root, branch, HEAD | Rejected. It cannot establish clean source state. |
| B - identity plus cleanliness | root, branch, HEAD, staged/unstaged/untracked state | Near minimum, but lacks explicit object-format posture and operation-state handling. |
| C - identity, cleanliness, and operation state | root, branch/detached, HEAD, object format, status cleanliness, unmerged/conflict state, worktree identity by provenance | Selected with a narrow caveat: complete rebase/cherry-pick/revert/bisect path detection needs a future filesystem control-state boundary if required. |
| D - broad repository inventory | tracked files, ignored files, object database, remotes, config, worktree registry, refs | Rejected as excessive for initial activation. |

Selected observation set: a narrowed Option C.

## Exact Command And Argv Contract

The future contract may approve only these exact Git tuples for initial repository-observation eligibility:

| Capability ID | Exact argv | Purpose | Expected output contract |
| --- | --- | --- | --- |
| `git_repository_root_v1` | `["rev-parse", "--show-toplevel"]` | Determine canonical repository top-level path as Git sees it. | One LF-terminated or non-LF single absolute path line, bounded, no stderr. |
| `git_object_format_v1` | `["rev-parse", "--show-object-format"]` | Determine repository object format before HEAD parsing. | One line exactly `sha1` or `sha256`, bounded, no stderr. |
| `git_head_object_v1` | `["rev-parse", "--verify", "HEAD"]` | Determine exact HEAD object identity. | One full object ID line matching object format, bounded, no stderr. |
| `git_branch_state_v1` | `["symbolic-ref", "--quiet", "--short", "HEAD"]` | Determine current branch or detached state. | Exit 0 with one branch name line, or exit 1 with empty stdout/stderr meaning detached HEAD; other exit codes blocked. |
| `git_cleanliness_status_v1` | `["status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames", "--ignore-submodules=none"]` | Determine staged, unstaged, untracked, and unmerged/conflict state in one stable machine-readable output. | Exit 0, NUL-delimited porcelain v1 records, bounded, no stderr. Empty stdout means clean. |

No caller may provide command names, flags, pathspecs, revisions, branch names, format strings, config overrides, environment, working directory, timeout, output limit, parser mode, or compatibility rules.

Rejected alternatives:

- `git rev-parse HEAD`: less explicit than `--verify HEAD`;
- `git log -1 --format=%H`: introduces a caller-like format string surface and is unnecessary;
- `git branch --show-current`: valid but less expressive for detached-state exit semantics than `symbolic-ref --quiet --short HEAD`; its 2.22.0 introduction remains version evidence if later selected;
- separate `git diff` and `git ls-files` commands: useful diagnostics, but broader surface than one NUL-delimited status command for initial eligibility;
- `git worktree list`, `git show-ref`, `git config`, `git cat-file`, `git check-ignore`, `git merge-base`: not required for the first contract.

## Working-Directory Model

The future runner must not use caller-provided cwd, ambient process cwd, or filesystem-discovered roots as authority.

Preferred model:

- working directory comes from an exact provenance-linked worktree capability emitted by the approved resolver/composition/revalidation chain;
- the path is source-controlled or provenance-linked to the approved repository root identity;
- the path is absolute, canonical, symlink-reviewed, lstat/revalidated immediately before use, and fingerprint-bound;
- root output from `git_repository_root_v1` must match the approved worktree identity after the reviewed path normalization contract;
- cross-worktree mismatch blocks the entire chain;
- TOCTOU remains unresolved and must be rechecked in any later activation.

Action 579 does not implement path handling.

## Environment Model

The future Git process environment should be a minimal fixed environment, not the inherited process environment.

Recommended posture:

- no caller environment;
- no inherited full environment;
- no credentials;
- no shell;
- no PATH lookup;
- exact executable `/usr/bin/git`;
- fixed locale only if output contracts require it, likely `LC_ALL=C` and `LANG=C`;
- disabled pager via fixed `GIT_PAGER=cat` and `PAGER=cat` or equivalent no-pager process policy;
- `GIT_TERMINAL_PROMPT=0`;
- `GIT_OPTIONAL_LOCKS=0`;
- `HOME` and `XDG_CONFIG_HOME` not inherited unless a future config-isolation review proves a safer fixed value;
- no `GIT_CONFIG_*` injection except a separately reviewed fixed config-suppression policy.

An empty environment may be insufficient because Git and macOS shims may need locale/path-neutral behavior to be deterministic. A future environment-isolation review must choose the exact fixed map before any runner implementation.

## Config Influence

The contract must not assume read-only commands are config-independent.

Known posture:

- `status --porcelain=v1` is documented as a script-stable format and independent of user configuration for the porcelain format;
- `--untracked-files=all`, `--no-renames`, and `--ignore-submodules=none` reduce config-dependent behavior for the selected status command;
- `diff` commands are not initially required; if later added, `--no-ext-diff` remains mandatory and textconv/attributes must be reviewed;
- repository config, system config, global config, conditional includes, attributes, excludes, and submodule config remain security inputs unless explicitly suppressed or bounded.

Future prerequisite:

- define whether system/global config are suppressed, whether repository config is accepted for these commands, whether include directives are rejected, and how `safe.directory` ownership behavior is handled.

## Hooks, Filters, Pagers, And External Programs

Approved tuples must not invoke hooks, editors, signing programs, credential helpers, remote helpers, merge tools, checkout filters, or LFS smudge/clean filters.

For the selected initial command set:

- `rev-parse` and `symbolic-ref` are local metadata reads under exact tuple restrictions;
- `status --porcelain=v1 -z` is local worktree/index observation but may inspect ignore and submodule metadata;
- no `diff`, `difftool`, checkout, merge, commit, or remote command is approved;
- pager usage must be disabled by process policy;
- no shell or external executable delegation is permitted.

If any future evidence shows an approved tuple can invoke uncontrolled external behavior under the fixed environment/config posture, that tuple must be removed or blocked pending a separate review.

## Network And Credential Posture

Read-only means local repository observation only, not networked read access.

The contract prohibits:

- fetch, pull, push, clone, ls-remote, submodule update, remote helpers, SSH, HTTP, Git protocol, credential helpers, authentication prompts, browser/device-code flows, and network filesystem discovery;
- credential references, credential leases, Keychain access, environment secrets, config-provided credentials, URL credentials, cookies, sessions, BankID, Avanza, or broker data.

Required fixed fields:

- `networkUsed:false`;
- `credentialsUsed:false`;
- `credentialAuthorityGranted:false`;
- `gitRemoteOperation:false`;
- `gitCredentialHelperInvoked:false`.

## Mutation Posture

The contract categorically prohibits add, commit, reset, restore, checkout, switch, clean, merge, rebase, cherry-pick, revert, tag creation, branch creation/deletion, config writes, update-index, update-ref, gc, maintenance, repack, prune, worktree add/remove, submodule mutation, stash creation/application, push, fetch, and any command that may mutate index, config, refs, worktree, object database, or repository metadata.

`GIT_OPTIONAL_LOCKS=0` should be required in the future process environment so incidental optional locks are avoided where Git supports that behavior. If a selected command still mutates or locks despite this posture, it is not eligible for the first activation contract.

## Output-Contract Requirements

Every selected command needs a separate pure output interpretation contract before runner implementation.

Shared output requirements:

- exact expected exit-code set;
- UTF-8 or byte-safe parser posture defined per command;
- no stderr except the branch detached exit-1 case, where stderr must be empty;
- byte limits fixed per command;
- no best-effort parsing;
- no broad trim;
- no logging of repository paths or filenames unless separately approved;
- malformed output blocks;
- overflow and truncation are ambiguous or blocked;
- all raw outputs are retained only as neutral raw-completion evidence until interpreted by pure contracts;
- fingerprints bind raw bytes/text, parser identity, session, purpose, tool, executable, argv, working-directory identity, and no-authority flags.

Command-specific requirements:

| Capability | Exit code | Stdout | Empty output |
| --- | --- | --- | --- |
| root | 0 only | one absolute path line | blocked |
| object format | 0 only | `sha1` or `sha256` | blocked |
| HEAD | 0 only | 40 hex for `sha1`, 64 hex for `sha256` | blocked |
| branch | 0 or 1 only | one short branch line on 0; empty on 1 | exit 1 means detached; exit 0 empty blocked |
| status | 0 only | NUL-delimited porcelain v1 records | clean |

## Object-Format Posture

The initial contract must not assume SHA-1. It requires `git_object_format_v1` before `git_head_object_v1`.

Allowed object formats:

- `sha1`: HEAD must be exactly 40 lowercase hexadecimal characters;
- `sha256`: HEAD must be exactly 64 lowercase hexadecimal characters.

Unknown object formats block. Abbreviated object IDs block. Uppercase hex blocks unless a future parser explicitly normalizes and fingerprints that normalization.

## Path And Filename Safety

Repository paths are sensitive evidence.

Path posture:

- root path is compared to the approved worktree identity and then retained only as an opaque/fingerprinted reference where possible;
- status output must use `-z` to avoid C-style quoting ambiguity;
- filenames are never converted into shell commands;
- absolute paths, traversal, NUL inside a path field, invalid UTF-8 where text parsing is used, unsafe Unicode normalization ambiguity, duplicate path records, submodule ambiguity, and unmerged states block or make the chain ambiguous;
- initial eligibility should retain counts, classes, and fingerprints, not full filenames, unless a future audit requirement approves sanitized filename retention.

## TOCTOU Model

Read-only observations can become stale immediately.

Required future ordering:

1. validate original worktree capability and executable capability;
2. revalidate working directory path before each Git command or run a closed command sequence under one immediately fresh worktree capability;
3. collect root;
4. collect object format;
5. collect HEAD before status;
6. collect branch state;
7. collect status;
8. collect HEAD again or bind a freshness policy if any later operation relies on the observed HEAD remaining stable;
9. assemble one immutable evidence set;
10. expire quickly and require a repeat immediately before any later operation.

No result may claim `toctouEliminated:true`. The required posture is `toctouEliminated:false`.

## Capability Artifact Design

Future source-controlled artifact:

| Field | Planned value |
| --- | --- |
| kind | `read_only_git_activation_capability_contract` |
| id | `ture.execution.read-only-git-activation-capability.first-live-staging-preflight.v1` |
| version | `1` |
| platform | `macos` |
| canonical executable | `/usr/bin/git` |
| executable provenance | approved resolver/composition/revalidation chain |
| working directory provenance | approved worktree capability only |
| approved capabilities | the five exact tuples above |
| optional diagnostics | separate diff/ls-files commands only after review |
| prohibited capabilities | mutation, remote, credential, config-write, shell, helper, broad inventory |
| environment posture | fixed minimal non-secret, no inherited environment |
| config posture | unresolved fixed policy required before runner implementation |
| output contracts | separate pure contracts required before runner implementation |
| one-shot posture | required for any future live collection sequence |
| authority | `none` |
| repositoryReadAuthorityGranted | `false` until separate activation |
| runtimeActivated | `false` |
| authorizationConsumed | `false` |
| toctouEliminated | `false` |

The artifact fingerprint must bind identity, version, platform, executable, working-directory provenance, every exact argv tuple, command order, output contract IDs, byte limits, environment posture, config posture, prohibited classes, sequencing, freshness, no-authority flags, and unresolved prerequisite markers.

## Compatibility-Baseline Impact

Action 579 is sufficient to resume numeric or tuple compatibility-baseline derivation only after acknowledging these remaining prerequisites:

- exact output contracts for root, object format, HEAD, branch, and status;
- exact fixed environment map;
- config influence policy;
- complete active-operation detection decision;
- Apple package/build policy if compatibility needs Apple provenance beyond upstream version;
- feature-version evidence for every selected command and flag.

Known version evidence:

- `branch --show-current` is not selected; if later selected, Git 2.22.0 release notes are the earliest currently reviewed evidence.
- `status --porcelain=v1` and `-z` are documented current script-stable choices, but Action 579 does not derive an introduction floor.
- `symbolic-ref --quiet --short HEAD`, `rev-parse --show-toplevel`, `rev-parse --show-object-format`, `rev-parse --verify HEAD`, `status --no-renames`, and `status --ignore-submodules=none` require exact feature-history review before a numeric baseline is finalized.

Therefore Action 579 recommends output-contract planning before numeric baseline derivation.

## Non-Authorizations

This contract grants no Git command authority, repository-read authority, process execution authority, process observation authority, process control or termination authority, CLI compatibility authority, credential authority, network authority, runtime authority, API/UI/runner authority, staging authority, deployment authority, Avanza/trading authority, persistence authority, authorization-consumption authority, order behavior, position behavior, or settlement behavior.

## Decision

Decision: `post_trade_read_only_git_activation_capability_contract_defined`

Result status: `post_trade_read_only_git_activation_capability_action_579_completed`

Recommended next Action: Action 580 - Plan Pure Read-Only Git Observation Output Contracts.

## Commit / Deploy

No deploy is recommended for Action 579. No commit, push, merge, or deploy occurred.
