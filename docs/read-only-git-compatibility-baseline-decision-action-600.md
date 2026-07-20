# Action 600 - Read-Only Git Compatibility Baseline Decision

Action 600 completes the compatibility-baseline decision for the exact read-only Git repository-observation capability set. This is documentation, evidence review, compatibility-policy decision, and approval-gate work only. It does not implement a compatibility evaluator, repository-observation runner, process execution path, repository inspection path, runtime/API/UI/cron/worker reachability, credentials, environment inheritance, network, Avanza, trading, persistence, migrations, deployment, retries, fallback, commit, push, merge, or deploy behavior.

## Current Approved Baseline

The approved baseline now includes:

- generic Git version parsing for exact `git version x.y.z`;
- Apple Git vendor-suffix parsing for exact `git version x.y.z (Apple Git-N)`;
- exact read-only Git activation capability tuples from Action 579;
- pure output interpretation contracts for root, object format, HEAD, branch state, and porcelain status;
- byte-oriented porcelain-status completion and interpretation;
- pure aggregate repository-observation evidence;
- dormant repository-observation runner architecture planning from Action 599.

No compatibility evaluator exists. No compatibility decision is consumed by runtime. No repository-read authority exists. No live Git repository-observation chain exists. No runtime caller exists.

## Previous Unresolved State

Action 574 could not derive a numeric baseline because the production chain then needed only `git --version`, Apple `/usr/bin/git` produced an Apple-suffixed version string, and the future repository-observation command set was not exact.

Action 578 resolved Apple version-output grammar but still left command-capability compatibility unresolved. Action 579 fixed the capability set. Actions 580-598 added and reviewed the pure output and aggregate contracts. Action 599 planned the runner architecture. Those changes now provide enough source-controlled scope to decide a compatibility baseline without implementing evaluation.

## Exact Capability Matrix

| ID | Exact argv | Required semantics | Earliest supported upstream version proven in reviewed sources | Source | Confidence | Caveats | Apple applicability | Baseline impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `git_repository_root_v1` | `["rev-parse", "--show-toplevel"]` | Print absolute top-level worktree path; error without worktree. | `2.29.0` proven in reviewed docs; older support likely but not needed for this baseline. | Official `git-rev-parse` 2.29.0 docs. | High for 2.29.0+. | Path evidence remains non-authoritative and privacy-bound. | Applies by upstream-equivalent version. | Below final floor. |
| `git_object_format_v1` | `["rev-parse", "--show-object-format"]` | Print storage object-format algorithm, defaulting to storage. | `2.29.0` proven in reviewed docs. | Official `git-rev-parse` 2.29.0 docs. | High for 2.29.0+. | Later docs add more modes; Ture uses default storage only. | Applies by upstream-equivalent version. | Candidate strict floor before status flag review. |
| `git_head_object_v1` | `["rev-parse", "--verify", "HEAD"]` | Verify exactly one revision and emit full object ID. | `2.10.5` proven in reviewed docs; `2.29.0` also documents it. | Official `git-rev-parse` 2.10.5 and 2.29.0 docs. | High. | Object ID length/format is interpreted by approved object-format-aware parser. | Applies by upstream-equivalent version. | Below final floor. |
| `git_branch_state_v1` | `["symbolic-ref", "--quiet", "--short", "HEAD"]` | Print shortened branch ref on attached HEAD; quiet nonzero detached state. | `2.1.4`-era support is indicated by the official manual change table, with 2.39.0 docs showing exact flags and detached exit semantics. | Official `git-symbolic-ref` docs. | High for 2.39.0 baseline; medium for exact earliest. | Detached HEAD remains observation, not compatibility success. | Applies by upstream-equivalent version. | Below final floor. |
| `git_porcelain_status_v1` | `["status", "--porcelain=v1", "-z", ...]` | Stable porcelain v1 machine format with NUL termination. | `2.0.5` proven for porcelain and `-z`; `2.39.0` proves exact `--porcelain=v1` spelling. | Official `git-status` 2.0.5 and 2.39.0 docs. | High. | Parser accepts byte evidence only; no UTF-8 decoding by runner. | Applies by upstream-equivalent version. | Below final floor after `--no-renames`. |
| `git_status_untracked_all_v1` | `["status", "--untracked-files=all"]` | Include individual untracked files in untracked directories. | `2.0.5` proven. | Official `git-status` 2.0.5 docs. | High. | Performance is not compatibility authority. | Applies by upstream-equivalent version. | Below final floor. |
| `git_status_no_renames_v1` | `["status", "--no-renames"]` | Disable rename detection regardless of user configuration. | `2.39.0` proven in reviewed official docs. | Official `git-status` 2.39.0 docs. | High for 2.39.0+. | Earlier support may exist, but Action 600 does not rely on unproven history. | Applies by upstream-equivalent version. | Sets final reviewed floor at `2.39.0`. |
| `git_status_ignore_submodules_none_v1` | `["status", "--ignore-submodules=none"]` | Override submodule ignore settings and report submodule differences. | `2.0.5` proven; `2.39.0` confirms current exact semantics. | Official `git-status` 2.0.5 and 2.39.0 docs. | High. | Submodule status remains observation, not repository-read authority. | Applies by upstream-equivalent version. | Below final floor. |

Complete baseline: `2.39.0`, because every required capability is documented at or before `2.39.0`, and `--no-renames` is the strictest capability for which this review has official exact-version evidence.

## Generic Git Baseline

Selected generic upstream policy shape:

- implementation family: `upstream_git`;
- minimum version: `2.39.0`;
- supported major family: `2`;
- future major versions: rejected pending separate review;
- stable releases only;
- no prerelease, development, dirty, custom suffix, abbreviated, malformed, or repaired versions;
- unknown vendor suffixes rejected.

This is not a generic "Git is compatible" statement. It means only that accepted upstream Git parser evidence meets the source-controlled floor for the exact read-only repository-observation command set.

## Apple Git Baseline

Selected Apple policy shape:

- implementation family: `apple_git`;
- require accepted Apple parser evidence;
- require upstream-equivalent semantic version to satisfy the same `2.39.0` floor and supported major `2`;
- retain Apple build number as fingerprint-bound evidence;
- do not use Apple build number as the primary comparator;
- reject Apple parser rejection, malformed suffix, unknown vendor text, prerelease upstream versions, or future major versions.

The observed tuple `git version 2.39.5 (Apple Git-154)` proves only that the approved parser can represent upstream-equivalent `2.39.5` and Apple build `154` as non-authoritative evidence. Apple build `154` does not independently prove capability support, monotonicity, security posture, or deployment readiness.

## Parser and Evidence Linkage

A future compatibility evaluator must consume only accepted parser evidence:

- accepted generic Git version interpretation evidence; or
- accepted Apple Git version interpretation evidence.

It must revalidate parser contract identity, parser version, grammar identity, raw-completion evidence fingerprint, source spawn fingerprint, executable identity `/usr/bin/git`, platform `macos`, policy identity, session, fixed argv `["--version"]`, authority `none`, `runtimeActivated:false`, `compatibilityAuthorityGranted:false`, and `toctouEliminated:false`.

It must reject rejected parser results, raw version strings, stale fingerprints, altered semantic versions, altered Apple vendor suffixes, altered executable/platform linkage, authority/live/runtime claims, unknown implementation families, and caller-supplied baselines.

## Implementation-Family Model

Closed model:

- `upstream_git`;
- `apple_git`;
- `unsupported_vendor_git`;
- `unknown`.

Initial policy supports only `upstream_git` and `apple_git`. Other vendor builds, including arbitrary parenthetical suffixes and downstream distribution suffixes, fail closed until separately reviewed. Vendor text is not accepted by substring or regex looseness.

## Compatibility Result Union

Future closed statuses:

- `input_rejected`;
- `implementation_unsupported`;
- `version_below_baseline`;
- `version_above_reviewed_range`;
- `capability_baseline_unresolved`;
- `compatible_for_read_only_observation`.

The positive status means only that reviewed parser evidence satisfies the Action 600 source-controlled baseline for the exact read-only observation capability set. It does not imply repository-read authority, process authority, runner activation, runtime readiness, deployment readiness, general Git compatibility, write-command support, staging readiness, or production readiness.

## Policy Identity and Model

Future policy identities:

- compatibility policy ID: `ture.execution.read-only-git-compatibility-policy.v1`;
- policy version: `1`;
- capability-set ID: `ture.execution.read-only-git-repository-observation-capability-set.root-object-format-head-branch-status.v1`;
- generic implementation-family ID: `ture.execution.git-implementation-family.upstream-git.v1`;
- Apple implementation-family ID: `ture.execution.git-implementation-family.apple-git.v1`;
- baseline evidence ID: `ture.execution.read-only-git-compatibility-baseline.action-600.v1`.

The future evaluator should use a versioned immutable source-controlled policy object, not caller-supplied baselines, environment configuration, database configuration, API/UI settings, or deployment metadata.

## Future Policy Fields

Required immutable fields:

- policy identity/version;
- capability-set identity/version;
- generic minimum version `2.39.0`;
- generic supported major `2`;
- Apple minimum upstream-equivalent version `2.39.0`;
- Apple build posture `fingerprint_bound_evidence_not_comparator`;
- supported implementation families `upstream_git` and `apple_git`;
- prerelease posture `rejected`;
- unknown-vendor posture `rejected`;
- future-major posture `version_above_reviewed_range`;
- authority `none`;
- `runtimeActivated:false`;
- `repositoryReadAuthorityGranted:false`;
- `laterActivationEligibility:false`;
- `toctouEliminated:false`.

## Prerelease and Development Version Posture

Stable releases only. Reject release candidates, development snapshots, `.dirty`, build metadata, custom vendor suffixes, malformed extra tokens, abbreviated versions, missing patch components, component repair, leading-zero repairs, and non-ASCII version digits.

This aligns with the approved parser outputs: the generic parser accepts strict three-component upstream output, and the Apple parser accepts strict upstream three-component plus exact `Apple Git-N` suffix.

## Future Major Version Posture

Future Git major versions beyond major `2` must produce `version_above_reviewed_range` until a separate compatibility expansion Action reviews the exact capability set against that major.

This avoids assuming indefinite backward compatibility.

## Capability Versus Version

Version evidence alone is not repository-read authority. It is sufficient only for a pure compatibility-policy result when combined with:

- exact parser evidence;
- exact implementation-family policy;
- exact read-only capability-set identity;
- exact executable/platform/session/linkage;
- no authority/runtime claims.

The future runner's command outputs can later provide observation evidence, but the runner must not be activated to prove compatibility before compatibility, repository-read authorization, and process authority are separately approved.

## Authority Limits

Compatibility approval grants no process authority, repository-read authority, mutation authority, CLI authority, runtime authority, staging authority, deployment authority, credentials, network, Avanza/trading authority, persistence authority, migration authority, commit authority, push authority, or merge authority.

Even a positive future result must keep:

- `authority:"none"`;
- `compatibilityAuthorityGranted:false`;
- `runtimeActivated:false`;
- `repositoryReadAuthorityGranted:false`;
- `laterActivationEligibility:false`;
- `toctouEliminated:false`.

## Decision Option Comparison

| Option | Decision |
| --- | --- |
| A - one generic minimum for all implementations | Rejected. Apple Git has a reviewed parser and vendor suffix that must remain explicit. |
| B - separate generic upstream and Apple policies | Selected. Shared semantic floor, distinct implementation families, Apple build retained as evidence. |
| C - allowlist only observed Apple tuple | Rejected. Too narrow and would treat one observed tuple as policy authority. |
| D - keep baseline unresolved | Rejected. Exact capability set and official documentation now support a conservative baseline. |

Selected decision: Option B.

## Evidence Gaps

No blocking evidence gap remains for deciding the initial baseline. Non-blocking limitations:

- Action 600 does not prove the historically earliest possible version for every flag;
- Action 600 does not prove Apple build-number monotonicity;
- Action 600 does not review Git major `3` or unknown vendors;
- Action 600 does not implement the evaluator or runner.

## Test Strategy

Future Action 601 tests must cover:

- exact upstream minimum `2.39.0`;
- one patch/minor below the floor;
- same-major versions above the floor;
- future major rejection;
- Apple `2.39.5` build `154`;
- Apple upstream-equivalent below baseline;
- Apple build retained but not used as comparator;
- unknown Apple build behavior;
- unknown vendor suffix;
- prerelease/development/malformed evidence;
- rejected parser results;
- stale and recomputed fingerprints;
- wrong executable/platform/policy/session linkage;
- authority/live/runtime claims;
- capability-set mismatch;
- immutable policy;
- deterministic result fingerprints;
- no runtime caller.

## Mandatory Future Gates

1. Capability-evidence review.
2. Generic baseline review.
3. Apple policy review.
4. Vendor-family review.
5. Future-major posture review.
6. Prerelease posture review.
7. Policy identity/version review.
8. Input evidence revalidation review.
9. Result-union review.
10. Fingerprint review.
11. Authority/no-runtime review.
12. Export-surface review.
13. Runtime-reachability review.
14. Independent static security review.
15. Remediation and final re-review.
16. Repository-read authorization planning.
17. Process authority planning.
18. Dormant runner implementation review.
19. Staging-only activation review.
20. Deployment approval.

## Sources Reviewed

- Official Git `git-rev-parse` 2.29.0 documentation: https://git-scm.com/docs/git-rev-parse/2.29.0.html
- Official Git `git-rev-parse` 2.10.5 documentation: https://git-scm.com/docs/git-rev-parse/2.10.5.html
- Official Git `git-symbolic-ref` 2.39.0 documentation: https://git-scm.com/docs/git-symbolic-ref/2.39.0.html
- Official Git `git-status` 2.0.5 documentation: https://git-scm.com/docs/git-status/2.0.5.html
- Official Git `git-status` 2.39.0 documentation: https://git-scm.com/docs/git-status/2.39.0.html
- Apple Command Line Tools installation documentation: https://developer.apple.com/documentation/xcode/installing-the-command-line-tools/
- Local Actions 573-599 implementation, planning, review, remediation, and checkpoint documents.

## Explicit Non-Authorizations

Action 600 does not authorize Git execution, live repository inspection, process creation, process observation, process termination, repository-read authority, compatibility evaluator implementation, runner implementation, runtime/API/UI/cron/worker activation, credentials, environment access, network, Avanza, trading, orders, positions, settlement retrieval, persistence, migrations, deployment, commit, push, merge, retries, fallback, or broad Git command support.

## Decision

Decision: `post_trade_read_only_git_compatibility_baseline_decision_ready`

Result status: `post_trade_read_only_git_compatibility_action_600_decision_gate_completed`

Recommended next Action: Action 601 - Implement Pure Read-Only Git Compatibility Policy Contract.

No deploy is recommended for Action 600. No commit, push, merge, or deploy occurred.
