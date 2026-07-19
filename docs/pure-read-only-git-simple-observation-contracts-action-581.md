# Action 581 - Pure Read-Only Git Simple Observation Contracts

## Scope

Action 581 implements pure, deterministic, fixture-only interpretation contracts for four read-only Git observations planned in Action 580:

- repository root from `git rev-parse --show-toplevel`;
- repository object format from `git rev-parse --show-object-format`;
- HEAD object ID from `git rev-parse --verify HEAD`;
- symbolic branch or detached state from `git symbolic-ref --quiet --short HEAD`.

It also adds a pure completion-input contract that accepts only these exact command tuples as synthetic fixture evidence from the existing dormant direct-spawn boundary.

This action does not implement porcelain status. It does not implement a runner, server-only wrapper, compatibility policy, repository-inspection execution, process observation, Git execution, API/UI wiring, deployment, persistence, credentials, environment access, network access, Avanza/trading behavior, orders, positions, or settlement behavior.

## Files

Created:

- `lib/post-trade-pure-read-only-git-observation-completion-contract-core.ts`;
- `lib/post-trade-pure-read-only-git-repository-root-interpretation-contract-core.ts`;
- `lib/post-trade-pure-read-only-git-object-format-interpretation-contract-core.ts`;
- `lib/post-trade-pure-read-only-git-head-object-id-interpretation-contract-core.ts`;
- `lib/post-trade-pure-read-only-git-branch-state-interpretation-contract-core.ts`;
- `tests/e2e/post-trade-pure-read-only-git-simple-observation-contracts.spec.ts`.

Documentation:

- `docs/pure-read-only-git-simple-observation-contracts-action-581.md`;
- `docs/pure-read-only-git-simple-observation-action-581-checkpoint.md`.

## Completion Input Boundary

The new completion contract identity is:

`ture.execution.pure-read-only-git-observation-completion-contract.fixture.v1`

The boundary accepts only synthetic, fixture-only completion records linked to:

`ture.execution.dormant-server-only-fixed-read-only-direct-spawn-adapter.server.v1`

The accepted executable is exactly `/usr/bin/git`, the platform is exactly `macos`, the purpose is exactly `first_live_read_only_staging_preflight`, and authority remains `none`.

The accepted command definitions are closed:

| Capability | Exact argv | Accepted exit codes |
| --- | --- | --- |
| `git_repository_root_v1` | `["rev-parse", "--show-toplevel"]` | `0` |
| `git_object_format_v1` | `["rev-parse", "--show-object-format"]` | `0` |
| `git_head_object_v1` | `["rev-parse", "--verify", "HEAD"]` | `0` |
| `git_branch_state_v1` | `["symbolic-ref", "--quiet", "--short", "HEAD"]` | `0`, `1` |

Caller-supplied paths, arbitrary argv, unknown tools, non-macOS platform values, stderr output, overflow, invalid UTF-8, stream errors, retries, fallback, signal claims, runtime claims, live observation claims, TOCTOU-elimination claims, and authority grants are rejected fail-closed.

## Repository Root Contract

Identity:

`ture.execution.pure-read-only-git-repository-root-interpretation-contract.fixture.v1`

The contract accepts one optional-final-LF line containing a narrow absolute POSIX-style path. It rejects empty output, relative paths, `/`, trailing slash, repeated slash, dot components, parent components, multiple lines, whitespace at the boundary, tabs, carriage returns, NUL, control characters, ANSI escapes, and oversized output.

The returned path is evidence only. The contract does not claim canonical filesystem identity, repository-read authority, or TOCTOU elimination.

## Object-Format Contract

Identity:

`ture.execution.pure-read-only-git-object-format-interpretation-contract.fixture.v1`

The contract accepts only:

- `sha1`;
- `sha256`.

It rejects transition or multi-format output, qualifiers, unknown formats, uppercase output, whitespace, multiple lines, carriage returns, NUL, control characters, ANSI escapes, and oversized output.

The output determines the expected HEAD object-ID length:

- `sha1`: 40 hex characters, 20 bytes;
- `sha256`: 64 hex characters, 32 bytes.

## HEAD Object-ID Contract

Identity:

`ture.execution.pure-read-only-git-head-object-id-interpretation-contract.fixture.v1`

The contract requires an accepted object-format interpretation result with matching session, purpose, platform, executable, working-directory fingerprint, and observation-sequence identity.

The HEAD parser recomputes the object-format evidence and result fingerprints before accepting the object-format result as linkage input. A stale or tampered object-format fingerprint is rejected.

HEAD output must be one optional-final-LF lowercase full-length hex object ID for the linked object format. The contract rejects short IDs, uppercase hex, non-hex characters, all-zero IDs, multiple lines, whitespace, carriage returns, NUL, control characters, and ANSI escapes.

## Branch State Contract

Identity:

`ture.execution.pure-read-only-git-branch-state-interpretation-contract.fixture.v1`

The contract accepts two closed states:

- attached branch: exit code `0` with a narrow short branch name;
- detached HEAD: exit code `1` with empty stdout.

Attached branch names are intentionally narrow: no `refs/heads/` prefix, no absolute-style slash, no repeated slash, no `..`, no `@{`, no bare `@`, no `.lock` suffix, no leading dot component, no spaces, no control characters, and no shell-sensitive punctuation beyond the approved ASCII subset.

Detached state is represented as `branchState:"detached"` with no branch name.

## Fingerprints

Each contract returns immutable evidence and a deterministic result fingerprint. Fingerprints bind:

- contract identity;
- command capability;
- fixed argv;
- source spawn fingerprint;
- session;
- purpose;
- platform;
- executable;
- working-directory fingerprint;
- observation sequence;
- original and normalized stdout fingerprints;
- rejection reasons;
- authority and runtime false claims.

Fingerprints grant no provenance or authority by themselves.

## Authority

Every current result preserves:

- `observedLiveProcess:false`;
- `repositoryReadAuthorityGranted:false`;
- `processAuthorityGranted:false` where present;
- `cliExecutionAuthorityGranted:false` where present;
- `compatibilityAuthorityGranted:false`;
- `runtimeActivated:false`;
- `toctouEliminated:false`;
- `authority:"none"`.

Accepted parser evidence means only that synthetic fixture completion output matched the closed grammar. It does not mean Git was executed, a live repository was inspected, the repository is compatible, a runner is enabled, staging is ready, deployment is allowed, or TOCTOU was eliminated.

## Test Coverage

The focused Action 581 suite covers:

- identity and policy immutability;
- exact argv closure;
- static purity and prohibited-operation scans;
- completion input acceptance and fail-closed rejection;
- root grammar acceptance and rejection;
- object-format grammar acceptance and rejection;
- HEAD object-ID parsing with object-format linkage and fingerprint validation;
- branch attached and detached states;
- cross-contract substitution rejection;
- deterministic fingerprints;
- deep immutability;
- porcelain-status remains unimplemented.

## Remaining Blockers

Before runtime use, separate future actions must still review or implement:

- static security review of these contracts;
- porcelain-status output contract;
- aggregate read-only Git observation result model;
- Git compatibility policy;
- server-only orchestration and runner wiring;
- controlled live validation;
- deployment approval.

## Non-Authorization

Action 581 authorizes none of the following: Git execution, process creation, process observation, repository reads through production behavior, compatibility decisions, runner activation, API/UI wiring, credentials, environment access, network access, Avanza/trading behavior, order or position changes, persistence, commit, push, merge, or deployment.
