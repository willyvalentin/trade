# Action 578 - Apple Git Compatibility Baseline

## Approved Action 577 Checkpoint

Action 578 starts from:

- workspace: `/Users/willysimonsson/Dev/trade-action-534`;
- branch: `codex/action-534-live-resolver`;
- HEAD checkpoint: `8aafdf2 Add reviewed pure Apple Git version parser`;
- initial worktree status: clean.

Action 577 approved the pure Apple Git version interpretation contract as fixture-only, deterministic, platform-scoped, and non-authoritative.

## Current Evidence

Reviewed evidence now available:

| Field | Evidence |
| --- | --- |
| canonical executable | `/usr/bin/git` |
| platform scope | reviewed macOS / Apple Command Line Tools environment |
| observed output | `git version 2.39.5 (Apple Git-154)` |
| upstream parsed version | `2.39.5` |
| Apple vendor identity | `Apple Git` |
| Apple build | `154` |
| Command Line Tools package receipt | `com.apple.pkg.CLTools_Executables` |
| Command Line Tools package version | `16.4.0.0.1.1747106510` |
| executable signature evidence | `com.apple.dt.xcode_select.tool-shim` from Action 575 |
| generic parser posture | strict, suffix-rejecting, unchanged |
| Apple parser posture | pure, fixture-only, reviewed, non-authoritative |

No compatibility decision currently exists. No runtime caller exists. No live product-chain Apple Git evidence exists. Parser acceptance means grammar acceptance only. Authority remains `none`, `observedLiveProcess:false`, and `toctouEliminated:false`.

## Compatibility Dimensions

Compatibility remains split into separate dimensions:

| Dimension | Question | Action 578 status |
| --- | --- | --- |
| Output-grammar compatibility | Can the observed output be parsed by an approved contract? | Resolved for the reviewed Apple grammar. |
| Command-capability compatibility | Does Git support the exact commands and flags required by the chain? | Unresolved for future activation because the exact activation command contract is not yet approved. |
| Apple-packaging compatibility | Does Apple build/package identity satisfy reviewed platform requirements? | Not independently resolved; package/build semantics are evidence, not a policy floor. |
| Security compatibility | Does the implementation contain required fixes for the exact threat model? | Unresolved for future repository inspection because the threat model and command set are not exact. |
| Runtime/deployment readiness | Is runtime/deployment authorized? | Out of scope and unauthorized. |

These dimensions must not collapse into one boolean without a future source-controlled policy.

## Current Dormant-Chain Requirements

The current dormant chain requires only:

- exact `/usr/bin/git`;
- exact argv `["--version"]`;
- ordinary zero-exit completion;
- empty stderr;
- bounded valid UTF-8 stdout;
- exact Apple output grammar;
- successful pure Apple interpretation.

For this limited dormant chain, a numeric Git compatibility floor beyond successful grammar interpretation would be tautological. The chain does not inspect a repository, parse branch state, parse file paths, read config, traverse objects, invoke hooks/helpers, use credentials, access network, mutate state, or deploy.

Therefore Action 578 does not derive a numeric baseline from the current dormant `git --version` chain.

## Future Activation Requirements

The dormant runner catalog currently lists possible read-only Git repository inspection commands:

| Command | Classification | Action 578 conclusion |
| --- | --- | --- |
| `git rev-parse --show-toplevel` | structurally present in dormant runner catalog | Not yet approved as this compatibility policy's activation requirement. |
| `git rev-parse HEAD` | structurally present in dormant runner catalog | Not yet approved as this compatibility policy's activation requirement. |
| `git branch --show-current --no-color` | structurally present in dormant runner catalog | Requires exact activation contract and version/security review. |
| `git status --porcelain=v1 --untracked-files=all --no-renames` | structurally present in dormant runner catalog | Requires exact activation contract and config/path/security review. |
| `git diff --cached --name-status --no-ext-diff` | structurally present in dormant runner catalog | Requires exact activation contract and external-helper/textconv/security review. |
| `git diff --name-status --no-ext-diff` | structurally present in dormant runner catalog | Requires exact activation contract and external-helper/textconv/security review. |
| `git ls-files --others --exclude-standard` | structurally present in dormant runner catalog | Requires exact activation contract and ignore-pattern/path/security review. |

Development commands such as branch checks, status checks, logs, diffs, commits, pushes, and worktree management remain development-only. They do not define production compatibility.

Future activation commands remain insufficiently reduced into an exact approved capability contract, so numeric compatibility remains premature.

## Upstream Version Semantics

The upstream parsed version `2.39.5` is useful evidence, but not by itself a sufficient compatibility baseline.

Official Git documentation supports `git --version` as the version-check command and documents the relevant future commands and options. Git status documentation states porcelain v1 is stable for scripts and independent of user configuration for the documented format. Git diff documentation states `--no-ext-diff` disallows external diff drivers.

However, Action 578 does not assume that Apple's upstream number alone proves all future command behavior, security posture, or backported fixes. Apple may package, patch, or wrap Git differently from an upstream release. The reviewed Apple parser evidence does not prove feature behavior beyond the exact version-output grammar.

## Apple Build Semantics

Apple build `154` is retained as vendor/build evidence, not a semver value.

Apple documentation reviewed in Actions 575 and 578 documents Command Line Tools installation, package receipt inspection through `pkgutil --pkg-info=com.apple.pkg.CLTools_Executables`, installation under `/Library/Developer/CommandLineTools`, and updating via Software Update. It does not document a stable `Apple Git-N` grammar, monotonic Apple Git build comparison, build-to-upstream-source mapping, build-to-security-fix mapping, or whether the build can reset/change format.

Because Apple build semantics remain underdocumented, Action 578 does not choose Apple build `154` as a minimum or exact allowlist for compatibility. It remains evidence to be bound in a future policy artifact after the exact activation requirements are known.

## Security Baseline

Current dormant `git --version` chain:

- no repository inspection;
- no config, hooks, attributes, submodules, alternates, object database, worktree path, credential helper, network, or mutation behavior;
- no Git security minimum is justified beyond output grammar acceptance.

Future repository inspection raises separate security questions:

- untrusted repositories and ownership checks;
- config includes and safe-directory behavior;
- hooks and external helpers;
- attributes and textconv/external diff behavior;
- submodules and alternates;
- worktrees and crafted paths;
- object parsing and SHA-1/SHA-256 assumptions;
- path quoting, NUL handling, and unusual filenames.

Git release notes document `safe.directory` changes related to CVE-2022-24765 in the Git 2.30.4 line. Action 578 does not use that alone to inflate the current dormant baseline because the current chain does not inspect repositories, and the future activation threat model is not yet exact.

## Policy-Shape Conclusion

Action 573's supported-major plus per-major-minimum shape remains possible for generic upstream Git policy, but it is not sufficient alone for Apple `/usr/bin/git`.

For Apple `/usr/bin/git`, a future source-controlled artifact may need a closed tuple that includes:

- platform;
- canonical executable;
- accepted parser contract identity;
- upstream version posture;
- Apple build posture;
- CLT package posture if a reviewed provenance contract requires it;
- exact command/flag capability list;
- security posture.

Action 578 does not create that production policy module.

## Numeric Baseline Decision

No numeric baseline is derived.

Reasons:

1. The current dormant production chain only needs `git --version` plus approved Apple grammar interpretation, so a numeric compatibility floor would add no meaningful independent check.
2. Future read-only repository-inspection commands are structurally present in a dormant runner catalog but are not yet approved as the exact activation capability contract for this compatibility policy.
3. Apple build/package semantics are insufficiently documented for a numeric minimum or exact allowlist to be selected without first knowing the exact future command/security requirements.
4. Security requirements for untrusted repository inspection remain undefined for the future activation path.

Selected decision option:

`OPTION 2 - ACTIVATION CAPABILITY CONTRACT REQUIRED`

## Future Baseline Artifact Design

A future source-controlled compatibility baseline artifact should include:

| Field | Planned posture |
| --- | --- |
| baseline kind | `pure_apple_git_compatibility_policy_baseline` |
| baseline ID | `ture.execution.apple-git-compatibility-baseline.first-live-read-only-staging-preflight.v1` |
| baseline version | `1` |
| platform scope | `macos` |
| executable | `/usr/bin/git` |
| accepted parser contract | `ture.execution.pure-apple-git-version-interpretation-contract.fixture.v1` |
| upstream-version policy | unresolved pending activation capability contract |
| Apple-build policy | unresolved pending activation capability contract and Apple provenance review |
| CLT package policy | unresolved pending activation capability contract and provenance review |
| required capabilities | unresolved exact read-only activation command set |
| excluded capabilities | mutation, remote, credentials, hooks/helpers unless separately controlled, network, checkout, deployment |
| security posture | unresolved pending exact threat model |
| future-major posture | reject until reviewed |
| future-build posture | reject or unresolved until reviewed |
| resolution status | `unresolved_pending_read_only_activation_capability_contract` |
| observedLiveProcess | `false` |
| compatibilityAuthorityGranted | `false` |
| runtimeAuthorityGranted | `false` |
| stagingAuthorityGranted | `false` |
| deploymentAuthorityGranted | `false` |
| authority | `none` |
| toctouEliminated | `false` |

The artifact fingerprint should bind every source-controlled field, evidence reference, parser identity, package/provenance posture, required command list, excluded capability list, status, and no-authority flags.

## Non-Authorizations

Action 578 grants no process execution or observation authority, Git command authority, repository access authority, compatibility authority, runtime authority, staging authority, deployment authority, credential authority, network authority, API/UI/runner authority, Avanza/trading authority, persistence authority, or implementation approval for a compatibility evaluator.

## Decision

Decision: `post_trade_apple_git_compatibility_policy_baseline_unresolved_pending_read_only_activation_capability_contract`

Result status: `post_trade_git_compatibility_baseline_action_578_completed_unresolved`

Recommended next Action: Action 579 - Define Exact Read-Only Git Activation Capability Contract.

## Commit / Deploy

No deploy is recommended for Action 578. No commit, push, merge, or deploy occurred.
